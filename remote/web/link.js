/* DAP-Share, the page at /remote/. Copyright (c) 2026 Spiridon Iconomou. All rights reserved. */
/**
 * A secure line from a web page to one DAP agent, through the relay's door for browsers
 * (src/share/relay.js, the WebSocket listener). The page asks the relay for the agent by its
 * dap_id, runs the Noise XX handshake with it, and refuses to go on unless the other end proves
 * that very identity. From then on the relay carries only ciphertext.
 *
 *   const link = await openLink({ relay: "wss://relay.example.org", dap_id, public_key, identity });
 *   link.send('{"...": ...}');   const line = await link.read();   link.close();
 *
 * The relay is not trusted, so the line fails closed: a line that does not decrypt, a line that is
 * too long, more unread lines than a page should be made to hold, or an answer that does not come
 * in time ends the link, and the page opens a new one. A link is never left one answer out of step.
 *
 * One conversation at a time: from the moment sendBytes is called until its file has left,
 * send and sendChunk say "busy". A page that wants to ask something during a long transfer opens
 * a second link for the file. A sendBytes that fails after part of the file has gone ends the
 * line: the other end must never be left in the middle of a file.
 *
 * A browser cannot hold a WebSocket back, so whoever sends a page many lines must wait for the
 * page: at most MAX_QUEUED (256) lines may be unread, and more ends the line as "flooded". An
 * agent that sends a file therefore sends a window of chunks (64, say) and waits for the page to
 * ask for more. The same when a page uploads: the agent answers, it does not comment on every chunk.
 *
 * Whoever is on the path can cut the line at any line boundary, and the page then sees an
 * ordinary end with what came before still readable. Anything that must be whole (a file, a
 * list) carries its own length or end, checked by the reader.
 *
 * `WebSocketImpl` is for tests; a browser has its own.
 */
import { Handshake, handshakeLine, parseHandshakeLine, MAX_CHUNK } from "./noise.js";

// The longest legitimate line: a full Noise transport message in base64, with margin.
const MAX_LINE = 128 * 1024;
// Lines that have arrived and that nobody has read yet. A line is only known to be the agent's
// when it is read, so whoever is on the path must not be able to pile them up without limit.
const MAX_QUEUED = 256;
// How much may wait in the browser's send queue before sendBytes pauses.
const SEND_QUEUE = 1024 * 1024;
const MAX_TIMER = 2 ** 31 - 1;
const enc = new TextEncoder();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A clock that only goes forward, also when the phone corrects its time.
const now = () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now());
/**
 * How long to wait, from what a caller passed: 0, null and Infinity mean no limit (0 is
 * returned); a positive number is that many ms; anything else (a budget that is used up, NaN) is
 * a wait that is already over (-1), never an endless one.
 */
function clock(value) {
  if (value === 0 || value === null || value === Infinity) return 0;
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.min(n, MAX_TIMER) : -1;
}

/** What each refusal from the relay means for the person holding the phone. */
export const RELAY_REASONS = {
  "peer not registered": "offline",
  "peer did not answer": "no-answer",
  "peer is busy": "busy",
  "relay is full": "relay-full",
  // Too much came from this network at once (the address is often shared: a home, an office).
  "too many knocks": "slow-down",
  "too many channels from your address": "slow-down",
};

/** An Error of this module: `code` is always one of the words listed at openLink and at the link's methods. */
export function linkError(code, message) {
  const e = new Error(message || code);
  e.code = code;
  e.link = true;
  return e;
}

/** Bytes as a Uint8Array, from an ArrayBuffer or any view of one; null for anything else. */
function asBytes(data) {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return data instanceof Uint8Array ? data : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return null;
}

/**
 * Open the line. Rejects with an Error whose `code` says why:
 *   relay-unreachable, timeout, aborted, closed, offline, no-answer, busy, relay-full, slow-down,
 *   relay-refused, handshake, wrong-peer, line-too-long, flooded.
 * A page that tries again waits between attempts (1 s, 2 s, 4 s, ...): the relay counts knocks
 * per network address, and a loop without a pause uses up the allowance of everyone at it.
 * `public_key` (64 hex) pins the agent's whole key next to its dap_id, when the page knows it.
 * `timeoutMs` bounds everything up to the finished handshake (0, null or Infinity: no limit; a
 * budget that is already used up fails at once with timeout); `signal` (an AbortSignal) stops an
 * attempt in progress.
 */
export function openLink({ relay, dap_id, public_key = null, identity, timeoutMs = 15000, signal = null, WebSocketImpl }) {
  const WS = WebSocketImpl || WebSocket;
  return new Promise((resolve, reject) => {
    let ws;
    try {
      ws = new WS(relay);
    } catch (e) {
      return reject(linkError("relay-unreachable", String((e && e.message) || e)));
    }
    ws.binaryType = "arraybuffer";
    const decoder = new TextDecoder();
    let buffer = "";
    const lines = [];
    const waiters = [];
    let closeHandlers = [];
    let ended = false;
    let endReason = null;
    let session = null;
    let settled = false;
    let overall = null;
    let owed = null; // why the line was ended under a reader, to be told once: flooded, line-too-long
    let heard = now(); // when the other end was last heard from
    let dropRead = null; // gives up the file read in progress, when the line ends or the read takes too long

    /** End the line here and now, whatever the other end does; `reason` is told to onClose. */
    const finish = (reason) => {
      if (ended) return;
      ended = true;
      endReason = reason;
      try {
        ws.close();
      } catch {
        /* never opened, or already closed */
      }
      // What the agent sent before it hung up can still be read. After anything else (closed
      // here, a bad line, a late answer) nothing more comes out: ended means ended.
      if (reason !== "remote") lines.length = 0;
      if (dropRead) dropRead(null);
      for (const w of waiters.splice(0)) w(null);
      const told = closeHandlers;
      closeHandlers = [];
      for (const entry of told) {
        if (entry.taken) continue; // taken back by a handler that ran before it
        try {
          entry.fn(reason);
        } catch {
          /* one listener's fault is not the next one's */
        }
      }
    };
    // The signal stops an attempt. Once the line is up it has no say: the page closes that itself.
    const onAbort = () => settled || fail(linkError("aborted", "stopped"));
    const settle = () => {
      settled = true;
      clearTimeout(overall);
      if (signal) signal.removeEventListener("abort", onAbort);
    };
    const fail = (error) => {
      // The answer first: closing the socket can make the browser report an error of its own.
      if (!settled) {
        settle();
        reject(error);
      } else if (!ended) owed = error; // the next read says why, so it is not taken for a hang-up
      finish(error.code);
    };
    // One clock from the first byte to the finished handshake: a network that swallows the
    // connection must not leave the page waiting on the browser's own patience.
    const limit = clock(timeoutMs);
    if (limit < 0) return fail(linkError("timeout", "no time was left for a secure line"));
    if (limit) overall = setTimeout(() => fail(linkError("timeout", "no secure line within " + limit + " ms")), limit);
    if (signal) {
      if (signal.aborted) return fail(linkError("aborted", "stopped"));
      signal.addEventListener("abort", onAbort, { once: true });
    }

    const push = (line) => {
      heard = now(); // a whole line, which takes one of the places below: not any stray byte
      const w = waiters.shift();
      if (w) return w(line);
      if (lines.length >= MAX_QUEUED) return fail(linkError("flooded", "more lines arrived than were asked for"));
      lines.push(line);
    };
    /** The next raw line, or null once the line has ended. */
    const next = (ms) => {
      if (lines.length) return Promise.resolve(lines.shift());
      if (ended) return Promise.resolve(null);
      const wait = clock(ms);
      if (wait < 0) return Promise.reject(linkError("timeout", "no time was left for an answer"));
      return new Promise((res, rej) => {
        let w;
        const t = wait
          ? setTimeout(() => {
              waiters.splice(waiters.indexOf(w), 1);
              rej(linkError("timeout", "the other end did not answer in time"));
            }, wait)
          : null;
        w = (v) => {
          if (t) clearTimeout(t);
          res(v);
        };
        waiters.push(w);
      });
    };

    ws.onmessage = (ev) => {
      if (ended) return;
      buffer += typeof ev.data === "string" ? ev.data : decoder.decode(ev.data, { stream: true });
      let nl;
      while (!ended && (nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (line.length > MAX_LINE) return fail(linkError("line-too-long", "the other end sent a line longer than a secure line can be"));
        if (line) push(line);
      }
      if (!ended && buffer.length > MAX_LINE) fail(linkError("line-too-long", "the other end sent a line longer than a secure line can be"));
    };
    let opened = false;
    const lost = () => linkError("closed", "the connection closed before the secure line was up");
    ws.onclose = () => (settled ? finish("remote") : fail(lost()));
    // A browser may report an error before the close: once the relay had answered, it is a lost
    // connection either way, not a relay that cannot be reached.
    ws.onerror = () => (settled ? finish("remote") : fail(opened ? lost() : linkError("relay-unreachable", "could not reach the relay")));
    const raw = (text) => ws.send(text + "\n");
    /** Send what has just been encrypted. If it cannot go, the two ends no longer count alike: the line ends. */
    const write = (encrypted) => {
      try {
        raw(encrypted);
      } catch (e) {
        finish("unsent");
        throw linkError("unsent", String((e && e.message) || e));
      }
    };
    /** After the handshake: read one line and decrypt it with `how`; anything wrong ends the link. */
    const readWith = async (ms, how) => {
      let line;
      try {
        line = await next(ms);
      } catch (e) {
        finish("timeout"); // a late answer must not be taken for the answer to the next question
        throw e;
      }
      // Ended under the reader because too much or too long a line came: said once, so that it
      // is not taken for the other end hanging up.
      if (owed && (line === null || poisoned || endReason !== "remote")) {
        const error = owed;
        owed = null;
        throw error;
      }
      if (line === null) return null;
      // Another read failed while this one was waiting: what it was handed is not given out.
      if (poisoned || (ended && endReason !== "remote")) return null;
      try {
        return how(line);
      } catch {
        // Also when the agent had already hung up and its last lines were still waiting: after
        // a line that is not the agent's, none of the others is handed out.
        poisoned = true;
        lines.length = 0;
        finish("bad-line");
        throw linkError("bad-line", "a line that the other end did not send, or that was damaged on the way");
      }
    };

    let poisoned = false; // a line that was not the agent's has been seen: nothing more is handed out
    // One writer at a time: a file's chunks and a line look the same on the wire. The writer is
    // taken when sendBytes is called, not when its turn comes.
    let files = 0;
    let sending = Promise.resolve();
    const gone = (after, total) => linkError("closed", "the line ended after " + after + " of " + total + " bytes");
    const doSendBytes = async (data, options) => {
      const { onProgress = null, stallMs = 120000 } = options || {};
      if (ended) throw linkError("closed", "the line has ended");
      const blob = data != null && typeof data.size === "number" && typeof data.slice === "function" && typeof data.arrayBuffer === "function";
      const bytes = blob || data == null ? null : asBytes(data);
      if (!blob && !bytes) throw linkError("bad-input", "sendBytes takes bytes: a Uint8Array, an ArrayBuffer, or a Blob or File");
      const total = blob ? data.size : bytes.length;
      const stall = clock(stallMs); // 0: no limit
      if (stall < 0) throw linkError("timeout", "no time was left for the file");
      const tell = (sent) => {
        if (!onProgress) return;
        try {
          onProgress(sent, total);
        } catch {
          /* a fault in the caller's display is not a fault in the transfer */
        }
      };
      let still = 0; // how long nothing has moved, counting only time the page was awake for
      let polled = now();
      let seen = heard;
      let queue = ws.bufferedAmount;
      const stalled = (handed) => {
        finish("timeout");
        return linkError("timeout", "the network stopped taking the file after " + handed + " of " + total + " bytes");
      };
      // Wait until at most `most` is still queued in the browser. What is queued has not left the
      // phone: progress counts what has. "Moving" is the queue going down or the other end being
      // heard from; through a relay the queue goes down in steps, so the clock is a long one.
      const waitFor = async (most, handed) => {
        for (;;) {
          const q = ws.bufferedAmount;
          if (ended) {
            // The other end took it all, answered and hung up between two looks: that is sent.
            if (handed === total && q === 0 && endReason === "remote") return tell(total);
            throw gone(handed, total);
          }
          // Time in which the page itself was not running (a locked phone, a tab put to sleep) is
          // counted as two seconds at most per look: it neither ends a healthy upload at once
          // nor lets a dead one wait for ever.
          const t = now();
          still += Math.min(t - polled, 2000);
          polled = t;
          if (q < queue || heard !== seen) still = 0;
          queue = q;
          seen = heard;
          tell(Math.max(0, handed - Math.ceil((q * 3) / 4)));
          if (q <= most) return;
          if (stall > 0 && still > stall) throw stalled(handed);
          await sleep(20);
        }
      };
      let out = 0; // bytes handed to the browser so far
      let started = false;
      try {
        for (let o = 0; o < total; o += MAX_CHUNK) {
          let chunk;
          if (blob) {
            const want = Math.min(MAX_CHUNK, total - o);
            let read;
            let clockForRead = null;
            try {
              // A read that never comes back must not outlive the line, nor the clock: it is
              // given up when the line ends and after as long as a dead network would be.
              read = await new Promise((res, rej) => {
                dropRead = res;
                if (stall > 0) clockForRead = setTimeout(() => res(undefined), stall);
                Promise.resolve(data.slice(o, o + MAX_CHUNK).arrayBuffer()).then(res, rej);
              });
            } catch (e) {
              throw linkError("unreadable", "the file could not be read: " + String((e && e.message) || e));
            } finally {
              dropRead = null;
              clearTimeout(clockForRead);
            }
            if (read === undefined) throw stalled(o);
            if (read === null) throw gone(o, total);
            chunk = new Uint8Array(read);
            if (chunk.length !== want) throw linkError("unreadable", "the file changed while it was being sent");
          } else chunk = bytes.subarray(o, o + MAX_CHUNK);
          await waitFor(SEND_QUEUE, o);
          started = true; // from here the other end's count has moved, whatever happens to the bytes
          raw(session.encryptBytes(chunk));
          out = o + chunk.length;
          still = 0;
          queue = ws.bufferedAmount;
        }
        // Done when it has left the phone, not when it has been queued: an answer is then really on its way.
        await waitFor(0, total);
      } catch (e) {
        // Part of a file has gone and the rest will not follow: the other end is in the middle of
        // a file, and anything sent next would be read as more of it. The line ends here.
        if (started && out < total && !ended) finish("unsent");
        throw e && e.link === true ? e : linkError("unsent", String((e && e.message) || e));
      }
    };

    ws.onopen = async () => {
      opened = true;
      try {
        raw(JSON.stringify({ relay: "connect", to: dap_id }));
        const first = await next(0);
        if (first === null) return; // closed meanwhile: onclose has said so
        let reply = null;
        try {
          reply = JSON.parse(first);
        } catch {
          reply = null;
        }
        if (!reply || reply.relay !== "connected") {
          const reason = reply && typeof reply.reason === "string" ? reply.reason : "refused";
          throw linkError(Object.prototype.hasOwnProperty.call(RELAY_REASONS, reason) ? RELAY_REASONS[reason] : "relay-refused", "relay: " + reason);
        }
        const hs = new Handshake(identity, { initiator: true });
        raw(handshakeLine(1, hs.writeMessage1()));
        const second = await next(0);
        if (second === null) return;
        const m2 = parseHandshakeLine(second, 2);
        if (!m2) throw linkError("handshake", "the other end refused the secure session");
        const peer = hs.readMessage2(m2);
        // The whole point: the relay could hand us anybody. Only the agent holding this key will do.
        if (peer.dap_id !== dap_id) throw linkError("wrong-peer", "the other end is " + peer.dap_id + ", expected " + dap_id);
        if (public_key && peer.public_key !== public_key) throw linkError("wrong-peer", "the other end holds another key than the one expected");
        const m3 = await hs.writeMessage3();
        if (ended) return;
        raw(handshakeLine(3, m3));
        session = hs.finish();
        settle();
        resolve({
          peer,
          /** A value only this session has, the same at both ends: for showing matching digits. */
          channelBinding: Uint8Array.from(session.handshakeHash),
          /** Send one line of text, encrypted. Throws with code closed, busy or too-long. */
          send(text) {
            if (ended) throw linkError("closed", "the line has ended");
            if (files > 0) throw linkError("busy", "a file is being sent on this line");
            if (enc.encode(text).length > MAX_CHUNK) throw linkError("too-long", "a line can carry at most " + MAX_CHUNK + " bytes");
            write(session.encryptLine(text));
          },
          /** Send one chunk of at most MAX_CHUNK bytes; the other end reads it with readBytes. Throws with code closed, busy, bad-input or too-long. */
          sendChunk(data) {
            if (ended) throw linkError("closed", "the line has ended");
            if (files > 0) throw linkError("busy", "a file is being sent on this line");
            const bytes = data == null ? null : asBytes(data);
            if (!bytes) throw linkError("bad-input", "sendChunk takes bytes: a Uint8Array or an ArrayBuffer");
            if (bytes.length > MAX_CHUNK) throw linkError("too-long", "a chunk can carry at most " + MAX_CHUNK + " bytes");
            write(session.encryptBytes(bytes));
          },
          /**
           * Send bytes (a Uint8Array, an ArrayBuffer, or a Blob or File, read a slice at a time)
           * in chunks, never more than about a megabyte ahead of the network, and resolve when
           * they have left the phone. `onProgress(sent, total)` counts what has left it. Two
           * calls send one after the other. Rejects with code closed (the line ended first),
           * timeout (for `stallMs`, two minutes unless given, 0: no limit, nothing left the phone
           * and nothing was heard from the other end; the line is ended), unreadable (the file
           * could not be read, or changed), unsent (something else went wrong on the way) or
           * bad-input. When it fails after part of the file has gone, the line is ended.
           */
          sendBytes(data, options) {
            files++;
            const run = sending.then(() => doSendBytes(data, options)).finally(() => void files--);
            sending = run.catch(() => {});
            return run;
          },
          /**
           * The next decrypted line, or null when the line has ended. `ms` 0, null or Infinity
           * wait without limit; a budget that is used up fails at once. An answer that does not
           * come within `ms` ends the line (code timeout): give an answer that follows a long
           * transfer the time it needs. Throws once with code flooded or line-too-long when the
           * line was ended for that, and with bad-line for a line that is not the other end's.
           */
          read(ms = 15000) {
            return readWith(ms, (line) => session.decryptLine(line));
          },
          readBytes(ms = 15000) {
            return readWith(ms, (line) => session.decryptBytes(line));
          },
          get closed() {
            return ended;
          },
          /** Why the line ended: closed (here), remote (the other end, or the network), timeout, bad-line, line-too-long, flooded, unsent. */
          get closeReason() {
            return endReason;
          },
          get buffered() {
            return ws.bufferedAmount;
          },
          /** Lines that have arrived and have not been read yet (at most 256). */
          get queued() {
            return lines.length;
          },
          /** `fn(reason)` once when the line ends. Returns a function that takes it back. */
          onClose(fn) {
            if (ended) {
              try {
                fn(endReason);
              } catch {
                /* as when the line ends later */
              }
              return () => {};
            }
            const entry = { fn, taken: false };
            closeHandlers.push(entry);
            return () => {
              entry.taken = true;
              const i = closeHandlers.indexOf(entry);
              if (i !== -1) closeHandlers.splice(i, 1);
            };
          },
          /** End the line now. Reads return null at once; it does not wait for the other end. */
          close() {
            if (ended) lines.length = 0; // the other end had hung up first: its last lines are not handed out after this either
            owed = null;
            finish("closed");
          },
        });
      } catch (e) {
        // Only this module's own errors carry their code out; anything else (a browser's
        // DOMException has a number for a code) is a handshake that failed.
        fail(e && e.link === true ? e : linkError("handshake", String((e && e.message) || e)));
      }
    };
  });
}
