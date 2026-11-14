/* DAP-Share, the page at /remote/. Copyright (c) 2026 Spiridon Iconomou. All rights reserved. */
/**
 * The owner's phone as a remote (docs/REMOTE.md), everything that is not the page itself: reading
 * a pairing code, the four digits, the owner's channel (requests and answers, §3.1), the main
 * line that is kept open and opened again, and files on lines of their own (§3.2). The page
 * (remote.js) shows what this says; tests run it in Node against the real agent.
 *
 *   const remote = createRemote({ storage, name: "Annas iPhone", onState: (s) => show(s) });
 *   await remote.start();                       // the stored pairing, if any, and the main line
 *   await remote.pair(textOfTheScannedCode);    // when there is none
 *   window.DAP_TRANSPORT = remote.transport;    // what the screen asks through
 *
 * `storage` is { get(key), set(key, value), delete(key) }, each returning a promise: IndexedDB in
 * the page, a Map in a test. Three things are kept: "identity" (the phone's key), "pairing" (the
 * agent's key, dap_id, the relay's address, the owner's name) and nothing else from here.
 *
 * Nothing here trusts the relay: the line is opened to the key in the pairing code and to no
 * other, and whatever comes out of step, too long or too much ends the line (link.js). A line
 * that has ended is opened again after a pause, 1 s, 2 s, 4 s ... 30 s, and never faster: the
 * relay counts knocks per network address, and that address is often shared.
 */
import { openLink as openLinkDefault } from "./link.js";
import { createIdentity as createIdentityDefault, identityFromKeys, newIdentity, fingerprint, fromHex, toHex } from "./noise.js";
import { sha256 } from "../vendor/noble.js";

/** A body travels in chunks of at most this many bytes (§3.1). */
export const BODY_CHUNK = 60000;
/** The ceiling for a file, in either direction (§3.2). The agent holds the same one. */
export const MAX_FILE = 200 * 1024 * 1024;
/** The longest answer the agent gives (§3.1). */
export const MAX_ANSWER = 8 * 1024 * 1024;
/** The longest body a request may carry (§3.1). */
export const MAX_REQUEST = 256 * 1024;
/** The page says how much it has taken after this many chunks; the agent is at most 64 ahead. */
export const ACK_EVERY = 16;
/** The pauses between attempts to open the main line. The last one is repeated. */
export const PAUSES = [1000, 2000, 4000, 8000, 16000, 30000];
/**
 * The screen asks for the state every other second. Over the owner's line each answer is some
 * kilobytes of a phone's data plan, so an answer is given again for this long, unless something
 * has been asked of the agent since (a post, which may have changed it).
 */
export const STATE_FRESH_MS = 5000;
/** A line counts as having worked when it stayed up this long: only then does the next pause start at 1 s again. */
const STEADY_MS = 30000;
/**
 * A press whose line died with the question on it is asked again on the next line, with the
 * same `once`, for this long: the agent does it once and gives its first answer again. After
 * that it is said to have failed.
 */
const CARRY_MS = 120000;
/** How long the line beside the main one is kept when nothing is asked on it. */
const SIDE_IDLE_MS = 20000;
/** A file's line: an ack at least this often while something new has come, however slowly (§3.2). */
const ACK_MS = 10000;
/**
 * "You are not a remote" is believed when the computer has said it twice, this far apart. Being
 * wrong costs a trip to the computer to connect again, so one answer given in a bad moment (the
 * computer out of something for a second) is not enough to forget a pairing.
 */
export const GONE_TWICE_MS = 3000;
/** The three places a file can be fetched from (§3.2). What is still sealed is in none of them. */
export const PLACES = ["received", "share", "library"];
const QUEUE_MAX = 64;
const enc = new TextEncoder();

/**
 * An Error of this module. `code` is one of:
 *   not-a-code, newer-code                         the text was no pairing code (or one this page is too old for)
 *   unknown, declined, expired, full               the agent's answer to a pairing (OWNER_NO)
 *   gone                                           this phone is no longer a remote
 *   not-connected, closed, timeout, out-of-step    the main line is not up, ended, or answered wrongly
 *   one-at-a-time, too-much-waiting                a pairing or a file is going on already; too many questions wait
 *   too-big, empty, bad-input, cancelled           said here, before anything was sent
 *   refused                                        the agent said no to a file (`status`, `message` in the owner's language)
 *   cut                                            a file ended before all of it had come
 *   paired, not-paired, storage                    there is a pairing already; there is none; the browser keeps nothing
 * or one of link.js's own (offline, no-answer, slow-down, relay-unreachable, wrong-peer, ...).
 * `kind` sorts them for the person holding the phone: unreachable, slow-down, no-connection,
 * mismatch, or null when the code says it all.
 */
export function remoteError(code, message, more) {
  const e = new Error(message || code);
  e.code = code;
  e.remote = true;
  e.kind = kindOf(code);
  if (more) Object.assign(e, more);
  return e;
}

/** What a failed attempt to reach the agent means, in the four words the page has text for. */
export function kindOf(code) {
  switch (code) {
    case "offline": // the agent is not at the relay: asleep, or the app is not running
    case "no-answer":
    case "busy":
    case "handshake":
    case "bad-line":
    case "line-too-long":
    case "flooded":
    case "no-owner":
      return "unreachable";
    case "slow-down":
      return "slow-down";
    case "relay-unreachable":
    case "relay-full":
    case "relay-refused":
    case "timeout":
    case "closed":
    case "aborted":
    case "unsent":
      return "no-connection";
    case "wrong-peer":
      return "mismatch";
    default:
      return null;
  }
}
const asRemote = (e) => (e && e.remote === true ? e : remoteError(e && e.link === true ? e.code : "closed", String((e && e.message) || e)));

/* ------------------------------ the pairing code ------------------------------ */

function fromBase64Url(s) {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
const LOOPBACK = /^(localhost|127(\.\d{1,3}){3}|\[::1\])$/i;

/**
 * Read a pairing code (§2): `https://dapshare.app/remote/#1.<key>.<token>.<relay>`, the whole
 * address or only what follows the `#`. Gives { public_key, dap_id, token, relay } with `relay`
 * a whole wss:// address (ws:// only to this very machine, for tests). Throws not-a-code, or
 * newer-code for a version this page does not know.
 */
export function parsePairingCode(text) {
  const no = (why) => remoteError("not-a-code", why);
  if (typeof text !== "string" || text.length > 2000) throw no("not a pairing code");
  let s = text.trim();
  const hash = s.indexOf("#");
  if (hash !== -1) s = s.slice(hash + 1);
  const parts = s.split(".");
  if (parts.length < 4) throw no("not a pairing code");
  if (parts[0] !== "1") throw /^\d{1,3}$/.test(parts[0]) ? remoteError("newer-code", "a pairing code of version " + parts[0]) : no("not a pairing code");
  if (!/^[A-Za-z0-9_-]{43}$/.test(parts[1])) throw no("the key in the code is not a key");
  if (!/^[A-Za-z0-9_-]{22}$/.test(parts[2])) throw no("the token in the code is not a token");
  let key;
  try {
    key = fromBase64Url(parts[1]);
  } catch {
    throw no("the key in the code is not a key");
  }
  if (key.length !== 32) throw no("the key in the code is not a key");
  let where;
  try {
    where = decodeURIComponent(parts.slice(3).join("."));
  } catch {
    throw no("the relay in the code is not an address");
  }
  let relay;
  if (/^wss?:\/\//i.test(where)) {
    let url;
    try {
      url = new URL(where);
    } catch {
      throw no("the relay in the code is not an address");
    }
    if (url.username || url.password || url.hash) throw no("the relay in the code is not an address");
    // Unencrypted only to this very machine: that is a test, never a phone on a network.
    if (url.protocol === "ws:" && !LOOPBACK.test(url.hostname)) throw no("the relay in the code is not reached over wss");
    if (url.protocol !== "ws:" && url.protocol !== "wss:") throw no("the relay in the code is not an address");
    relay = where.replace(/^wss?:\/\//i, (scheme) => scheme.toLowerCase());
  } else if (/^[a-z0-9]([a-z0-9.-]{0,251}[a-z0-9])?(:\d{1,5})?$/i.test(where)) relay = "wss://" + where.toLowerCase();
  else throw no("the relay in the code is not an address");
  const public_key = toHex(key);
  return { public_key, dap_id: fingerprint(public_key), token: parts[2], relay };
}

/**
 * The type a fetched file is handed to the browser as. Only kinds a browser shows or plays without
 * running anything get their own type; everything else (a web page, an SVG drawing, anything
 * unknown) is plain bytes, so that nothing received is ever run in this page's name.
 */
const TYPES = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", heic: "image/heic", heif: "image/heif",
  pdf: "application/pdf", txt: "text/plain", csv: "text/csv", md: "text/plain",
  mp4: "video/mp4", mov: "video/quicktime", m4v: "video/mp4", mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav",
  zip: "application/zip",
};
export function safeType(name) {
  const m = /\.([A-Za-z0-9]{1,5})$/.exec(typeof name === "string" ? name : "");
  const ext = m ? m[1].toLowerCase() : "";
  return Object.prototype.hasOwnProperty.call(TYPES, ext) ? TYPES[ext] : "application/octet-stream";
}

/** The four digits both ends show (§2), from the session's own value (`link.channelBinding`). */
export function pairingDigits(channelBinding) {
  const head = enc.encode("dap-share pairing\n");
  const all = new Uint8Array(head.length + channelBinding.length);
  all.set(head, 0);
  all.set(channelBinding, head.length);
  const h = sha256(all);
  const n = ((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> 0;
  return String(n % 10000).padStart(4, "0");
}

/* ------------------------------ one request (§3.1) ------------------------------ */

function parse(line) {
  if (line === null) return null;
  try {
    const v = JSON.parse(line);
    return v !== null && typeof v === "object" && !Array.isArray(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Ask one thing on an owner's line and read its answer: { status, body } (`body` undefined when
 * the answer had none). `method` is "GET" or "POST"; for a GET, the text fields of `body` ride on
 * the head line (place for files). Anything wrong with the answer (another id, more bytes than
 * announced, not JSON) ends the line: a line is never left one answer out of step.
 */
/** What an answer's bytes are known by (§3.1, `same`): the first 32 hex digits of their SHA-256. */
async function digestTag(bytes) {
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).slice(0, 32);
}

/**
 * One question and its answer on `link` (§3.1). `timeoutMs`: how long nothing at all may be heard
 * before the answer's first line; `chunkMs`: the same for each part of its body. With `tag` the
 * result carries what the body's bytes hash to. A `same` in a GET's `body` says "I have the
 * answer that hashes to this": the agent then answers 304 with nothing to read.
 */
export async function request(link, id, method, name, body, { timeoutMs = 30000, chunkMs = 30000, onHeard = null, tag = false, once = null } = {}) {
  if (typeof name !== "string" || !name || name.length > 64) throw remoteError("bad-input", "what is asked for has a name");
  const head = { id };
  let bytes = null;
  if (method === "GET") {
    for (const k of Object.keys(body || {})) {
      const v = body[k];
      if (k === "id" || k === "get" || k === "post" || k === "bytes" || k === "file") continue;
      if (typeof v === "string" || typeof v === "number") head[k] = String(v);
    }
    head.get = name;
  } else if (method === "POST") {
    head.post = name;
    if (once) head.once = once; // the same press asked again on a new line is not done again (§3.1)
    if (body && Object.keys(body).length) {
      bytes = enc.encode(JSON.stringify(body));
      if (bytes.length > MAX_REQUEST) throw remoteError("too-big", "a question may carry at most " + MAX_REQUEST + " bytes");
      head.bytes = bytes.length;
    }
  } else throw remoteError("bad-input", "GET or POST");
  const fail = (code, message) => {
    link.close();
    return remoteError(code, message);
  };
  try {
    link.send(JSON.stringify(head));
    if (bytes) for (let o = 0; o < bytes.length; o += BODY_CHUNK) link.sendChunk(bytes.subarray(o, o + BODY_CHUNK));
    let answer;
    for (;;) {
      answer = parse(await link.read(timeoutMs));
      if (answer === null) throw remoteError("closed", "the line ended before the answer");
      if (onHeard) onHeard();
      // Something that takes the agent long is said to be worked on, every few seconds (§3.1):
      // heard, and the answer is waited for again. `timeoutMs` is how long nothing may be heard.
      if (answer && answer.id === id && answer.wait === true) continue;
      break;
    }
    if (!answer || answer.id !== id || !Number.isInteger(answer.status)) throw fail("out-of-step", "not the answer to what was asked");
    const n = answer.bytes === undefined ? 0 : answer.bytes;
    if (!Number.isInteger(n) || n < 0 || n > MAX_ANSWER) throw fail("out-of-step", "an answer of impossible length");
    if (!n) return { status: answer.status, body: undefined };
    const all = new Uint8Array(n);
    let got = 0;
    while (got < n) {
      const chunk = await link.readBytes(chunkMs);
      if (chunk === null) throw remoteError("closed", "the line ended in the middle of an answer");
      if (!chunk.length || chunk.length > BODY_CHUNK || got + chunk.length > n) throw fail("out-of-step", "an answer that does not keep to its length");
      all.set(chunk, got);
      got += chunk.length;
      if (onHeard) onHeard();
    }
    let value;
    try {
      value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(all));
    } catch {
      throw fail("out-of-step", "an answer that is not JSON");
    }
    return tag ? { status: answer.status, body: value, tag: await digestTag(all) } : { status: answer.status, body: value };
  } catch (e) {
    if (!link.closed) link.close(); // whatever went wrong, the next answer on this line could not be trusted to be the next question's
    throw asRemote(e);
  }
}

/* ------------------------------ the remote ------------------------------ */

const defaultWait = (ms) => new Promise((r) => setTimeout(r, ms));
const clock = () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now());
const cleanName = (name) => {
  const s = String(typeof name === "function" ? name() : name || "").trim().slice(0, 40);
  return s || "phone";
};

/**
 * `storage`: see the top. `name`: what the phone calls itself (a string, or a function asked at
 * every hello). `onState(state)` is told every change. For tests: `openLink`, `createIdentity`,
 * `WebSocketImpl`, `wait(ms)` (the pauses), `pauses` and `stateFreshMs`.
 *
 * `state.phase` is one of
 *   starting       before start() has looked in the storage
 *   none           no pairing. `why`: null, or why the last attempt to pair ended (not-a-code,
 *                  newer-code, unknown, declined, expired, full, unreachable, slow-down,
 *                  no-connection, mismatch, storage)
 *   connecting     opening a line. `pairing` true while it is a pairing attempt; `lost` true when a
 *                  line that was up has ended and is opened again after `retryAt`
 *   pairing        `digits`: the owner compares them with the computer's and answers there
 *   connected      the main line is up; `name` is the owner's name for their agent
 *   unreachable    the computer does not answer (asleep, or the app is not running)
 *   slow-down      too many attempts from this network
 *   no-connection  the relay cannot be reached
 *   mismatch       whoever answers does not hold the key this phone was paired with
 *   gone           this phone is no longer a remote; the pairing has been forgotten
 * The four failures carry `why` (the code), `retryAt` (ms since 1970) and `attempt`.
 */
export function createRemote({ storage, name = "phone", onState = null, openLink = openLinkDefault, createIdentity = createIdentityDefault, WebSocketImpl, wait = defaultWait, pauses = PAUSES, stateFreshMs = STATE_FRESH_MS, goneTwiceMs = GONE_TWICE_MS } = {}) {
  if (!storage || typeof storage.get !== "function" || typeof storage.set !== "function" || typeof storage.delete !== "function") throw remoteError("bad-input", "storage is { get, set, delete }");
  let state = { phase: "starting" };
  let pairing = null; // { public_key, dap_id, relay, name, paired_at }
  let run = 0; // goes up whenever what is going on must stop: forget, stop, a new pairing
  let main = null; // the main line while it is up
  let active = true; // the page is in front
  let wake = []; // what waits for the page to come in front, or for a pause to be cut short
  let identity = null;
  let attempt = null; // the pairing attempt in progress: { link, abort }
  let transfer = false; // a file is on its way
  let ids = 0;
  const queue = []; // what waits to be asked on the main line, in order; queue[0] is being asked
  let pumping = false;
  let heard = 0; // goes up whenever anything of an answer arrives on the main line: a line that is heard from is alive
  let lastState = null; // the last answer about the state: { link, at, value }, until something is posted
  let posts = 0; // how many times something has been posted
  let saidGone = null; // when the computer first said this phone is no remote, until it says OWNER_OK again
  let lastKnown = null; // the last whole state and what its bytes hash to: { of, value, tag } (asked for again as "same")
  let side = null; // a second line, for what is only asked while something posted is being worked on
  let carried = []; // presses whose line died with them on it, for the next line: { job, until }

  const set = (next) => {
    state = next;
    if (onState) {
      try {
        onState(state);
      } catch {
        /* a fault in the page's display is not a fault in the line */
      }
    }
  };
  const poke = () => {
    for (const w of wake.splice(0)) w();
  };

  /* ---- the phone's key ---- */
  function getIdentity() {
    if (!identity) {
      identity = (async () => {
        const kept = await storage.get("identity");
        if (kept && typeof kept.public_key === "string") {
          if (kept.privateKey) return identityFromKeys(kept.privateKey, kept.public_key);
          if (typeof kept.seed === "string") return newIdentity(fromHex(kept.seed));
        }
        let id = await createIdentity();
        try {
          await storage.set("identity", id.privateKey ? { public_key: id.public_key, privateKey: id.privateKey } : { public_key: id.public_key, seed: id.seed });
        } catch (e) {
          if (!id.privateKey) throw e;
          // A browser that makes such a key but cannot keep it: one it can keep, then.
          id = newIdentity();
          await storage.set("identity", { public_key: id.public_key, seed: id.seed });
        }
        return id;
      })().catch((e) => {
        identity = null;
        throw remoteError("storage", "this browser does not keep the phone's key: " + String((e && e.message) || e));
      });
    }
    return identity;
  }

  /* ---- opening an owner's line: the hello and the agent's first answer ---- */
  async function dial(to, signal) {
    const id = await getIdentity();
    try {
      return await openLink({ relay: to.relay, dap_id: to.dap_id, public_key: to.public_key, identity: id, timeoutMs: 20000, signal, WebSocketImpl });
    } catch (e) {
      throw asRemote(e);
    }
  }
  /** A line on which the agent has said OWNER_OK. Throws gone when this phone is no remote any more. */
  async function ownerLine() {
    if (!pairing) throw remoteError("not-paired", "this phone is not connected to a computer");
    const to = pairing;
    const link = await dial(to);
    try {
      link.send(JSON.stringify({ type: "OWNER_HELLO", v: 1, name: cleanName(name) }));
      const first = parse(await link.read(20000));
      if (first && first.type === "OWNER_OK") return { link, name: typeof first.name === "string" ? first.name : null };
      if (first && first.type === "OWNER_NO" && first.reason === "unknown") throw remoteError("gone", "this phone is no longer a remote");
      throw remoteError("no-owner", first === null ? "the computer hung up" : "the computer did not answer as an owner's agent");
    } catch (e) {
      link.close();
      throw asRemote(e);
    }
  }
  /** A file's line was told this phone is no remote: the main line is opened again, and what it hears decides. */
  function askAgain(my) {
    if (my !== run) return;
    if (saidGone === null) saidGone = clock();
    const link = main;
    if (link) link.close();
  }
  async function becomeGone(my) {
    if (my !== run) return;
    run++;
    const was = pairing;
    pairing = null;
    endMain();
    dropCarried();
    poke();
    try {
      await storage.delete("pairing");
    } catch {
      /* it is forgotten here all the same; the next start asks the agent again */
    }
    set({ phase: "gone", name: was ? was.name : null });
  }

  /* ---- the main line ---- */
  function endMain() {
    const link = main;
    main = null;
    endSide();
    if (link) link.close();
    for (const job of queue.splice(0)) {
      if (job.once) carry(job);
      else job.reject(remoteError("closed", "the line to the computer ended"));
    }
  }
  /** Keep a press for the next line (CARRY_MS at most): it may have been done, or not; asking again with its `once` finds out. */
  function carry(job) {
    if (carried.some((c) => c.job === job)) return;
    job.started = false;
    const until = clock() + CARRY_MS;
    carried.push({ job, until });
    setTimeout(() => {
      const i = carried.findIndex((c) => c.job === job);
      if (i === -1) return;
      carried.splice(i, 1);
      job.reject(remoteError("closed", "the line to the computer ended"));
    }, CARRY_MS);
  }
  /** The pairing is gone or the remote stopped: nothing carried will be asked again. */
  function dropCarried() {
    for (const c of carried.splice(0)) c.job.reject(remoteError("closed", "the line to the computer ended"));
  }
  /** Resolves after `ms`, or sooner when the loop must stop or the pause is cut short (never under a second). */
  function pause(ms, my) {
    return new Promise((resolve) => {
      let done = false;
      let onWake = null;
      const end = () => {
        if (done) return;
        done = true;
        const i = wake.indexOf(onWake);
        if (i !== -1) wake.splice(i, 1);
        resolve();
      };
      const started = clock();
      let cut = false;
      onWake = () => {
        if (done) return;
        if (my !== run) return end();
        if (cut) return;
        cut = true;
        const left = Math.min(ms, pauses[0]) - (clock() - started);
        if (left <= 0) end();
        else Promise.resolve(wait(left)).then(end, end);
      };
      wake.push(onWake);
      Promise.resolve(wait(ms)).then(end, end);
    });
  }
  function inFront(my) {
    return new Promise((resolve) => {
      const look = () => (active || my !== run ? resolve() : wake.push(look));
      look();
    });
  }
  async function loop(my, link) {
    let step = 0; // pauses taken since a line last stayed up
    for (;;) {
      if (my !== run) return void (link && link.close());
      if (!link) {
        await inFront(my); // nobody is knocked for while the page is not looked at
        if (my !== run) return;
        set({ phase: "connecting", name: pairing.name, pairing: false, lost: false });
        try {
          const up = await ownerLine();
          if (my !== run) return void up.link.close();
          link = up.link;
          saidGone = null;
          if (up.name && up.name !== pairing.name) {
            pairing = { ...pairing, name: up.name };
            storage.set("pairing", pairing).catch(() => {});
          }
        } catch (e) {
          if (my !== run) return;
          if (e.code === "gone") {
            // Believed the second time, a little later (GONE_TWICE_MS); until then it is asked again.
            if (saidGone !== null && clock() - saidGone >= goneTwiceMs) return becomeGone(my);
            if (saidGone === null) saidGone = clock();
            await pause(Math.max(goneTwiceMs - (clock() - saidGone), 50), my);
            continue;
          }
          const ms = pauses[Math.min(step, pauses.length - 1)];
          step++;
          set({ phase: e.kind || "unreachable", why: e.code, name: pairing.name, retryAt: Date.now() + ms, attempt: step });
          await pause(ms, my);
          continue;
        }
      }
      const up = link;
      link = null;
      main = up;
      if (carried.length) {
        // Asked again, first, in the order they were pressed.
        const again = carried.splice(0).filter((c) => clock() < c.until).map((c) => c.job);
        for (const job of again) job.link = up;
        queue.unshift(...again);
        pump();
      }
      const since = clock();
      set({ phase: "connected", name: pairing.name });
      await new Promise((resolve) => up.onClose(resolve));
      if (main === up) endMain();
      if (my !== run) return;
      if (clock() - since >= STEADY_MS) step = 0;
      const ms = pauses[Math.min(step, pauses.length - 1)];
      step++;
      set({ phase: "connecting", name: pairing.name, pairing: false, lost: true, retryAt: Date.now() + ms });
      await pause(ms, my);
    }
  }

  async function pump() {
    if (pumping) return;
    pumping = true;
    try {
      while (queue.length) {
        const job = queue[0];
        if (job.link !== main || job.link.closed) {
          queue.shift();
          if (job.once) carry(job);
          else job.reject(remoteError("closed", "the line to the computer ended"));
          continue;
        }
        job.started = true;
        let answer = null;
        let error = null;
        try {
          // Thirty seconds of nothing is a dead line, for a post too: while the agent works on
          // one it says so every five seconds, however long the work takes.
          answer = await request(job.link, ++ids, job.method, job.name, job.body, { timeoutMs: 30000, onHeard: () => void heard++, tag: job.method === "GET", once: job.once });
        } catch (e) {
          error = e;
        }
        heard++;
        if (error && job.once && (error.code === "closed" || error.code === "timeout")) {
          // The line died with the press on it: it is asked again on the next line (§3.1, `once`).
          // (When the line's ending was seen first, the press is carried already.)
          if (queue[0] === job) queue.shift();
          carry(job);
          if (job.link && !job.link.closed) job.link.close();
          continue;
        }
        if (job.method !== "GET") {
          // Done (or not): whatever was read about the state while it was going on is old now.
          posts++;
          lastState = null;
        }
        if (queue[0] === job) queue.shift(); // (a line that ended meanwhile has emptied the queue itself)
        if (error) job.reject(error);
        else job.resolve(answer);
      }
    } finally {
      pumping = false;
    }
  }
  /** One question on the main line; resolves { status, body }. Rejects when it cannot be asked or answered. */
  function ask(method, what, body) {
    if (!main || main.closed) return Promise.reject(remoteError("not-connected", "the computer is not connected right now"));
    const how = String(method || "GET").toUpperCase();
    const key = how === "GET" ? what + "\n" + JSON.stringify(body || {}) : null;
    if (key) {
      // The same question waiting already, or being answered right now, with nothing posted
      // since it was asked: one answer serves both. (A slow line never carries two copies of
      // the same large answer one after the other.)
      for (let i = queue.length - 1; i >= 0; i--) {
        const job = queue[i];
        if (job.method !== "GET") break;
        if (job.key === key && job.posts === posts) return job.promise;
      }
      // Something posted is being worked on at the front (a fetch from a friend can take
      // minutes): what is only asked goes on a line beside it, so the screen stays alive.
      const front = queue[0];
      if (front && front.method !== "GET" && front.started) return beside(what, body, key);
    }
    return enqueue(how, what, body, key);
  }
  function enqueue(how, what, body, key) {
    if (!main || main.closed) return Promise.reject(remoteError("not-connected", "the computer is not connected right now"));
    if (queue.length >= QUEUE_MAX) return Promise.reject(remoteError("too-much-waiting", "too much is waiting for the computer's answer"));
    if (how !== "GET") {
      // What is posted may change the state: the next question about it is a real one.
      posts++;
      lastState = null;
    }
    const job = { method: how, name: what, body: body || {}, key, link: main, started: false, posts, once: how === "GET" ? null : toHex(crypto.getRandomValues(new Uint8Array(12))) };
    job.promise = new Promise((resolve, reject) => {
      job.resolve = resolve;
      job.reject = reject;
    });
    if (how === "GET") queue.push(job);
    else {
      // A press goes ahead of what is only asked and has not been started: the answer to those
      // is the newer for it.
      let at = queue.length;
      while (at > 0 && queue[at - 1].method === "GET" && !queue[at - 1].started) at--;
      queue.splice(at, 0, job);
    }
    pump();
    return job.promise;
  }
  /** A question on the line beside the main one; on the main line after all when that one cannot be opened. */
  function beside(what, body, key) {
    if (!side) side = { link: null, tail: Promise.resolve(), waiting: new Map(), timer: null };
    const s = side;
    const my = run;
    // The same question waiting there already, with nothing posted since it was asked: one answer serves both.
    const same = s.waiting.get(key);
    if (same && same.posts === posts) return same.promise;
    if (s.waiting.size >= 8) return enqueue("GET", what, body, key);
    if (s.timer) clearTimeout(s.timer);
    s.timer = null;
    const answered = s.tail.then(async () => {
      if (my !== run || side !== s) throw remoteError("closed", "the line to the computer ended");
      if (!s.link || s.link.closed) {
        const up = await ownerLine();
        if (my !== run || side !== s) {
          up.link.close();
          throw remoteError("closed", "the line to the computer ended");
        }
        s.link = up.link;
      }
      return request(s.link, ++ids, "GET", what, body, { timeoutMs: 30000, tag: true });
    });
    s.tail = answered.then(
      () => {},
      () => {}
    );
    const promise = answered.catch((e) => {
      if (my === run && main && !main.closed && e.code !== "gone") return enqueue("GET", what, body, key);
      throw e;
    });
    const entry = { promise, posts };
    s.waiting.set(key, entry);
    const done = () => {
      if (s.waiting.get(key) === entry) s.waiting.delete(key);
      if (side === s && !s.waiting.size) {
        // Kept for a while, for the next question of the same kind; then closed.
        s.timer = setTimeout(() => side === s && !s.waiting.size && endSide(), SIDE_IDLE_MS);
        if (s.timer && typeof s.timer.unref === "function") s.timer.unref();
      }
    };
    promise.then(done, done);
    return promise;
  }
  function endSide() {
    const s = side;
    side = null;
    if (!s) return;
    if (s.timer) clearTimeout(s.timer);
    if (s.link) s.link.close();
  }

  const remote = {
    get state() {
      return state;
    },
    /** What is kept about the computer this phone is a remote for, or null. */
    get pairing() {
      return pairing ? { ...pairing } : null;
    },
    /** Look in the storage; with a pairing there, open the main line and keep it open. */
    async start() {
      const my = ++run;
      endMain();
      poke();
      let kept = null;
      try {
        kept = await storage.get("pairing");
      } catch {
        kept = null;
      }
      if (my !== run) return;
      const whole = kept && typeof kept.public_key === "string" && /^[0-9a-f]{64}$/.test(kept.public_key) && typeof kept.relay === "string" && /^wss?:\/\//i.test(kept.relay);
      if (!whole) {
        pairing = null;
        return set({ phase: "none", why: null });
      }
      pairing = { public_key: kept.public_key, dap_id: fingerprint(kept.public_key), relay: kept.relay, name: typeof kept.name === "string" ? kept.name : "", paired_at: kept.paired_at || null };
      loop(my, null);
    },
    /**
     * Pair with the computer whose code this is (§2). Resolves { name } when the owner has said
     * yes there; rejects with the reason otherwise, and the state is `none` with that reason.
     * While the owner is asked, the state is `pairing` with the digits to compare.
     */
    async pair(code) {
      if (pairing) throw remoteError("paired", "this phone is connected to a computer already; forget it first");
      if (attempt) throw remoteError("one-at-a-time", "a pairing is going on");
      const my = ++run;
      const mine = { link: null, abort: typeof AbortController === "function" ? new AbortController() : null };
      attempt = mine;
      try {
        const to = parsePairingCode(code);
        set({ phase: "connecting", pairing: true, lost: false, name: null });
        const link = await dial(to, mine.abort ? mine.abort.signal : null);
        mine.link = link;
        if (my !== run) throw remoteError("cancelled", "stopped");
        link.send(JSON.stringify({ type: "OWNER_HELLO", v: 1, name: cleanName(name), token: to.token }));
        let said = parse(await link.read(20000));
        if (said && said.type === "OWNER_PAIRING") {
          // The digits are this end's own. An agent that shows others is not at the other end of this very session.
          const digits = pairingDigits(link.channelBinding);
          if (said.digits !== digits) throw remoteError("wrong-peer", "the two ends do not agree on the digits");
          if (my !== run) throw remoteError("cancelled", "stopped");
          set({ phase: "pairing", digits });
          // Not a word until the owner has answered: anything said now ends the attempt (§2). The agent waits two minutes.
          said = parse(await link.read(150000));
        }
        if (my !== run) throw remoteError("cancelled", "stopped");
        if (said && said.type === "OWNER_OK") {
          const next = { public_key: to.public_key, dap_id: to.dap_id, relay: to.relay, name: typeof said.name === "string" ? said.name : "", paired_at: Date.now() };
          try {
            await storage.set("pairing", next);
          } catch (e) {
            throw remoteError("storage", "this browser does not keep the connection: " + String((e && e.message) || e));
          }
          if (my !== run) throw remoteError("cancelled", "stopped");
          pairing = next;
          attempt = null;
          loop(my, link);
          return { name: next.name };
        }
        if (said && said.type === "OWNER_NO") throw remoteError(["unknown", "declined", "expired", "full"].indexOf(said.reason) !== -1 ? said.reason : "unknown", "the computer said no: " + said.reason);
        throw remoteError(said === null ? "closed" : "no-owner", "the computer did not answer the pairing");
      } catch (e) {
        const error = asRemote(e);
        if (mine.link) mine.link.close();
        if (attempt === mine) attempt = null;
        if (my === run) set({ phase: "none", why: error.code === "timeout" && state.phase === "pairing" ? "expired" : error.kind || error.code });
        throw error;
      }
    },
    /** Give up the pairing attempt that is going on. */
    cancelPairing() {
      const mine = attempt;
      if (!mine) return;
      attempt = null;
      run++;
      if (mine.abort) mine.abort.abort();
      if (mine.link) mine.link.close();
      set({ phase: "none", why: null });
    },
    /** Forget this computer: the pairing is removed from the phone. The phone's key stays. */
    async forget() {
      run++;
      pairing = null;
      endMain();
      dropCarried();
      poke();
      await storage.delete("pairing");
      set({ phase: "none", why: null });
    },
    /** Tell whether the page is in front. While it is not, no new line is opened. */
    setActive(on) {
      active = !!on;
      if (active) poke();
    },
    /** Try now instead of waiting out the pause (never sooner than a second after the last attempt). */
    retryNow() {
      poke();
    },
    /**
     * The page is in front again after a while. A line that died meanwhile (a phone that slept, a
     * network that changed) often looks alive: it is asked something small, and ended if nothing
     * at all has been heard on it within `ms`, so that it is opened again now and not after a
     * long wait. Any part of any answer counts as heard: a slow line with a long answer on its
     * way is a line that works. Something slow that is being done (a post) is left to its own clock.
     */
    probe(ms = 6000) {
      const link = main;
      if (!link || link.closed) return;
      const before = heard;
      // With nothing on its way the smallest question there is. With something posted at the
      // front the agent says "working on it" every five seconds: two of those missing is a
      // dead line too, so that one gets twice the time and no more.
      const posting = queue.length > 0 && queue[0].method !== "GET";
      if (!queue.length) ask("GET", "ping").catch(() => {});
      setTimeout(() => {
        if (main === link && !link.closed && heard === before) link.close();
      }, posting ? Math.max(ms, 12000) : ms);
    },
    /** End everything. The pairing stays in the storage. */
    stop() {
      run++;
      endMain();
      dropCarried();
      poke();
      if (attempt) {
        const mine = attempt;
        attempt = null;
        if (mine.abort) mine.abort.abort();
        if (mine.link) mine.link.close();
      }
    },
    ask,
    /**
     * What the screen asks through (`window.DAP_TRANSPORT`, §5): resolves with the answer's JSON
     * as the screen's API gives it, a refusal included; rejects when the agent cannot be reached.
     */
    transport(method, what, body) {
      const plain = (a) => (a.body === undefined ? (a.status === 200 ? {} : { error: "status " + a.status }) : a.body);
      const state = String(method).toUpperCase() === "GET" && what === "state" && !Object.keys(body || {}).length;
      if (!state) return ask(method, what, body).then(plain);
      // The state, asked for every other second by the screen: the answer from a moment ago, when
      // nothing has been posted since (STATE_FRESH_MS). Whatever the screen does itself is a post,
      // so what it then asks for is always a new answer.
      const kept = lastState;
      if (kept && kept.link === main && !kept.link.closed && clock() - kept.at < stateFreshMs) return Promise.resolve(kept.value);
      const link = main;
      const before = posts;
      // The agent is told which answer this page already has: when that is still the answer,
      // nothing of it is sent again (§3.1). A phone's data plan pays for what changes, not for asking.
      const known = lastKnown && pairing && lastKnown.of === pairing.public_key ? lastKnown : null;
      return ask(method, what, known ? { same: known.tag } : body).then((a) => {
        let value;
        if (a.status === 304 && known) value = known.value;
        else {
          value = plain(a);
          if (a.status === 200 && a.tag && value && value.me && pairing) lastKnown = { of: pairing.public_key, value, tag: a.tag };
        }
        // Kept only when it is a real answer about the agent and nothing was posted while it was on its way.
        if (posts === before && (a.status === 200 || a.status === 304) && value && value.me) lastState = { link, at: clock(), value };
        return value;
      });
    },
    /**
     * Fetch one file from the computer (§3.2), on a line of its own: resolves { name, size,
     * chunks } with exactly `size` bytes in `chunks`. `place` is received, share or library.
     * `onProgress(got, size)`; `signal` (an AbortSignal) stops it. With `onChunk(bytes)` the
     * chunks are handed over as they come and not kept here (`chunks` is then empty): a page
     * puts them away a few at a time instead of holding a large file twice. Rejects with refused
     * (the agent's `status` and words), too-big, cut (the line ended first), cancelled, gone, or
     * why the line could not be opened. A file is whole only when this resolves.
     */
    async download({ place, name: file, onProgress = null, onChunk = null, signal = null, chunkMs = 60000, ackMs = ACK_MS }) {
      if (PLACES.indexOf(place) === -1 || typeof file !== "string" || !file) throw remoteError("bad-input", "a place and a name");
      if (transfer) throw remoteError("one-at-a-time", "one file at a time");
      transfer = true;
      const my = run;
      let link = null;
      let up = false; // the line was open: from then on an ending is a file cut short, not a computer out of reach
      const stopNow = () => link && link.close();
      try {
        if (signal && signal.aborted) throw remoteError("cancelled", "stopped");
        ({ link } = await ownerLine());
        up = true;
        if (signal) signal.addEventListener("abort", stopNow);
        if (signal && signal.aborted) throw remoteError("cancelled", "stopped");
        link.send(JSON.stringify({ id: 1, file: "get", place, name: file }));
        const head = parse(await link.read(30000));
        if (head === null) throw remoteError("cut", "the line ended before the file");
        if (!head || head.id !== 1 || !Number.isInteger(head.status)) throw remoteError("out-of-step", "not an answer about the file");
        if (head.status !== 200) throw remoteError("refused", typeof head.error === "string" ? head.error : "", { status: head.status });
        const size = head.size;
        if (!Number.isInteger(size) || size < 0) throw remoteError("out-of-step", "a file without a size");
        if (size > MAX_FILE) throw remoteError("too-big", "the file is larger than the ceiling", { size });
        const tell = (got) => {
          if (!onProgress) return;
          try {
            onProgress(got, size);
          } catch {
            /* the display's fault, not the transfer's */
          }
        };
        const chunks = [];
        let got = 0;
        let count = 0;
        let ackedAt = clock();
        tell(0);
        while (got < size) {
          const chunk = await link.readBytes(chunkMs);
          // Fewer bytes and an ended line is a failed download, whatever the ending looked like.
          if (chunk === null) throw remoteError("cut", "the line ended after " + got + " of " + size + " bytes", { got, size });
          if (!chunk.length || got + chunk.length > size) throw remoteError("out-of-step", "more came than the file holds");
          if (onChunk) onChunk(chunk);
          else chunks.push(chunk);
          got += chunk.length;
          count++;
          // The agent is never more than 64 chunks ahead of what it has been told: tell it. And
          // tell it at least every ten seconds while something comes, so that on a slow line
          // its clock for silence never runs out between two acks.
          if (count % ACK_EVERY === 0 || got === size || clock() - ackedAt >= ackMs) {
            link.send(JSON.stringify({ ack: got }));
            ackedAt = clock();
          }
          tell(got);
        }
        // All of it is here, each chunk proven the agent's and in order. Its last word is waited for so that it hears ours.
        try {
          await link.read(15000);
        } catch {
          /* the file is whole all the same */
        }
        return { name: file, size, chunks };
      } catch (e) {
        const error = signal && signal.aborted ? remoteError("cancelled", "stopped") : asRemote(e);
        if (error.code === "gone") askAgain(my);
        throw up && (error.code === "closed" || error.code === "timeout") ? remoteError("cut", error.message) : error;
      } finally {
        transfer = false;
        if (signal) signal.removeEventListener("abort", stopNow);
        if (link) link.close();
      }
    },
    /**
     * Send one file to the computer's share folder (§3.2), on a line of its own. `data` is a
     * File or Blob (read a slice at a time) or bytes; resolves { name } with the name it got
     * there (`name (2).ext` when that was taken). `onProgress(sent, size)` counts what has left
     * the phone. Rejects with too-big, empty, refused (the agent's words), cut, cancelled, gone,
     * or unsure. The computer keeps nothing until this end has said `commit`, which it says when
     * the computer has all of the file: Cancel before that leaves nothing there. `unsure` is the
     * one case nobody can decide from here: the line ended after commit was said.
     */
    async upload({ data, name: file, onProgress = null, signal = null }) {
      const size = data && typeof data.size === "number" ? data.size : data && typeof data.byteLength === "number" ? data.byteLength : null;
      if (size === null || typeof file !== "string" || !file) throw remoteError("bad-input", "a file and its name");
      if (size > MAX_FILE) throw remoteError("too-big", "the file is larger than the ceiling", { size });
      if (size < 1) throw remoteError("empty", "the file is empty");
      if (transfer) throw remoteError("one-at-a-time", "one file at a time");
      transfer = true;
      const my = run;
      let link = null;
      let up = false; // the line was open: from then on an ending is a file cut short, not a computer out of reach
      let committed = false; // the phone has said "put it in place": from then on Cancel comes too late
      const stopNow = () => link && !committed && link.close();
      try {
        if (signal && signal.aborted) throw remoteError("cancelled", "stopped");
        ({ link } = await ownerLine());
        up = true;
        if (signal) signal.addEventListener("abort", stopNow);
        if (signal && signal.aborted) throw remoteError("cancelled", "stopped");
        link.send(JSON.stringify({ id: 1, file: "put", name: file, size }));
        const said = (v, what) => {
          if (v === null) throw remoteError("cut", "the line ended " + what);
          if (!v || v.id !== 1 || !Number.isInteger(v.status)) throw remoteError("out-of-step", "not an answer about the file");
          if (v.status !== 200) throw remoteError("refused", typeof v.error === "string" ? v.error : "", { status: v.status });
          return v;
        };
        said(parse(await link.read(30000)), "before the file");
        await link.sendBytes(data, { onProgress });
        // The agent says when all of it has arrived; it reads more slowly than a phone sends.
        const all = parse(await link.read(Math.min(600000, 60000 + Math.ceil(size / 16))));
        if (all === null) throw remoteError("cut", "the line ended before the computer had all of the file");
        if (!all || all.id !== 1) throw remoteError("out-of-step", "not an answer about the file");
        if (all.got === undefined) said(all, "before the computer had all of the file"); // a refusal, in the agent's words
        if (all.got !== size) throw remoteError("out-of-step", "the computer counted other bytes than were sent");
        // Until here nothing is kept on the computer if the line ends: Cancel is a real cancel.
        if (signal && signal.aborted) throw remoteError("cancelled", "stopped");
        committed = true;
        link.send(JSON.stringify({ commit: true }));
        if (onProgress) onProgress(size, size, true);
        const last = said(parse(await link.read(30000)), "before the computer had said the file is in place");
        return { name: typeof last.name === "string" ? last.name : file, size };
      } catch (e) {
        // After commit the phone cannot know: the file may be in the share folder or not.
        if (committed && !(e && e.code === "refused")) throw remoteError("unsure", "the line ended as the file was being put in place: it may have arrived");
        const error = signal && signal.aborted ? remoteError("cancelled", "stopped") : asRemote(e);
        if (error.code === "gone") askAgain(my);
        throw up && (error.code === "closed" || error.code === "timeout" || error.code === "unsent") ? remoteError("cut", error.message) : error;
      } finally {
        transfer = false;
        if (signal) signal.removeEventListener("abort", stopNow);
        if (link) link.close();
      }
    },
  };
  return remote;
}
