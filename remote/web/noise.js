/* DAP-Share, the page at /remote/. Copyright (c) 2026 Spiridon Iconomou. All rights reserved. */
/**
 * DAP secure sessions in a browser (SPEC §5.4): Noise_XX_25519_ChaChaPoly_SHA256, the same
 * handshake and wire format as src/dap/noise.js and clients/python/dap_noise.py, so a page on a
 * phone can talk to an agent the way two agents talk to each other.
 *
 * The primitives come from the audited noble libraries (../vendor/noble.js); nothing here is
 * written by hand except the Noise state machine, which is checked against the cacophony test
 * vector and against the Node agent's own handshake (test/web-link.test.js).
 *
 * An identity is an Ed25519 key that is made in the page and stays in the page. Where the browser
 * can (createIdentity), the private key is one the page itself cannot read out, only sign with:
 * { dap_id, public_key, sign(h) }. Otherwise it is { dap_id, public_key, seed }, hex.
 */
import { x25519, ed25519, chacha20poly1305, sha256 as sha256raw, hmac as hmacRaw } from "../vendor/noble.js";

export const PROTOCOL_NAME = "Noise_XX_25519_ChaChaPoly_SHA256";
export const MAX_CHUNK = 65535 - 16;
const EMPTY = new Uint8Array(0);
const MAX_NONCE = 2n ** 64n - 1n;
const enc = new TextEncoder();
const dec = new TextDecoder();

/* -------------------------------- bytes --------------------------------- */

export function concat(...parts) {
  let n = 0;
  for (const p of parts) n += p.length;
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
export const toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
export function fromHex(s) {
  if (typeof s !== "string" || s.length % 2 || /[^0-9a-f]/i.test(s)) throw new Error("not hex");
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
  return out;
}
export function toBase64(b) {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return btoa(s);
}
export function fromBase64(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ------------------------------ primitives ------------------------------ */

const sha256 = (...parts) => sha256raw(concat(...parts));
const hmac = (key, data) => hmacRaw(sha256raw, key, data);

function hkdf(chainingKey, ikm, n) {
  const temp = hmac(chainingKey, ikm);
  const out = [];
  let prev = EMPTY;
  for (let i = 1; i <= n; i++) {
    prev = hmac(temp, concat(prev, Uint8Array.of(i)));
    out.push(prev);
  }
  return out;
}

function nonceBytes(n) {
  const b = new Uint8Array(12);
  new DataView(b.buffer).setBigUint64(4, n, true);
  return b;
}
const aeadEncrypt = (key, n, ad, plaintext) => chacha20poly1305(key, nonceBytes(n), ad).encrypt(plaintext);
function aeadDecrypt(key, n, ad, ciphertext) {
  if (ciphertext.length < 16) throw new Error("ciphertext too short");
  return chacha20poly1305(key, nonceBytes(n), ad).decrypt(ciphertext);
}

/** An X25519 key pair { pub, priv } from 32 raw private bytes, or a fresh one. */
export function x25519Pair(priv) {
  const k = priv || crypto.getRandomValues(new Uint8Array(32));
  return { pub: x25519.getPublicKey(k), priv: k };
}
const dh = (mine, theirs) => x25519.getSharedSecret(mine.priv, theirs);

/** `dap:crypto:` + the first 16 hex characters of SHA-256 over the public key. */
export const fingerprint = (publicKeyHex) => "dap:crypto:" + toHex(sha256raw(fromHex(publicKeyHex))).slice(0, 16);

/** A new DAP identity from a seed the page holds (and so could read out). See createIdentity. */
export function newIdentity(seed) {
  const s = seed || crypto.getRandomValues(new Uint8Array(32));
  const public_key = toHex(ed25519.getPublicKey(s));
  return { sig_alg: "ed25519", dap_id: fingerprint(public_key), public_key, seed: toHex(s) };
}

/**
 * An identity around a key pair the browser keeps (WebCrypto Ed25519): `privateKey` is a CryptoKey
 * made with extractable = false, so no script, not even the page's own, can read the key out; it
 * can only ask for signatures while it runs. The CryptoKey can be put in IndexedDB as it is.
 */
export function identityFromKeys(privateKey, publicKeyHex) {
  return {
    sig_alg: "ed25519",
    dap_id: fingerprint(publicKeyHex),
    public_key: publicKeyHex,
    privateKey,
    sign: async (h) => new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, privateKey, h)),
  };
}

/** A new identity whose key cannot be read out where the browser supports that; otherwise from a seed. */
export async function createIdentity() {
  try {
    const pair = await crypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
    const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
    if (raw.length !== 32) throw new Error("unexpected public key");
    return identityFromKeys(pair.privateKey, toHex(raw));
  } catch {
    return newIdentity(); // an older browser: the key is kept as a seed
  }
}

/* ---------------------------- cipher state ------------------------------ */

export class CipherState {
  #k = null;
  #n = 0n;
  initializeKey(k) {
    this.#k = k;
    this.#n = 0n;
  }
  encrypt(ad, plaintext) {
    if (!this.#k) return plaintext;
    if (this.#n >= MAX_NONCE) throw new Error("nonce exhausted; the session must be renewed");
    const c = aeadEncrypt(this.#k, this.#n, ad, plaintext);
    this.#n++; // only after success: an input that cannot be encrypted must not put the two ends out of step
    return c;
  }
  decrypt(ad, ciphertext) {
    if (!this.#k) return ciphertext;
    if (this.#n >= MAX_NONCE) throw new Error("nonce exhausted; the session must be renewed");
    const p = aeadDecrypt(this.#k, this.#n, ad, ciphertext);
    this.#n++; // only after success: a forged message must not advance the nonce
    return p;
  }
}

class SymmetricState {
  cipher = new CipherState();
  constructor(protocolName) {
    const name = enc.encode(protocolName);
    this.h = name.length <= 32 ? concat(name, new Uint8Array(32 - name.length)) : sha256(name);
    this.ck = this.h;
  }
  mixKey(ikm) {
    const [ck, tempK] = hkdf(this.ck, ikm, 2);
    this.ck = ck;
    this.cipher.initializeKey(tempK);
  }
  mixHash(data) {
    this.h = sha256(this.h, data);
  }
  encryptAndHash(plaintext) {
    const c = this.cipher.encrypt(this.h, plaintext);
    this.mixHash(c);
    return c;
  }
  decryptAndHash(ciphertext) {
    const p = this.cipher.decrypt(this.h, ciphertext);
    this.mixHash(ciphertext);
    return p;
  }
  split() {
    const [k1, k2] = hkdf(this.ck, EMPTY, 2);
    const c1 = new CipherState();
    const c2 = new CipherState();
    c1.initializeKey(k1);
    c2.initializeKey(k2);
    return [c1, c2];
  }
}

/* ------------------------------ handshake ------------------------------- */

/** The Noise XX core. Keys can be injected (`s`, `e`) so it can be run against the test vectors. */
export class NoiseXX {
  #ss = new SymmetricState(PROTOCOL_NAME);
  #s;
  #e;
  #re = null;
  #rs = null;
  #initiator;

  constructor({ initiator, prologue = EMPTY, s = null, e = null }) {
    this.#initiator = initiator;
    this.#s = s || x25519Pair();
    this.#e = e;
    this.#ss.mixHash(prologue);
  }
  get h() {
    return this.#ss.h;
  }
  #ephemeral() {
    if (!this.#e) this.#e = x25519Pair();
    return this.#e;
  }

  // → e
  writeMessage1(payload = EMPTY) {
    if (!this.#initiator) throw new Error("only the initiator writes message 1");
    const e = this.#ephemeral();
    this.#ss.mixHash(e.pub);
    return concat(e.pub, this.#ss.encryptAndHash(payload));
  }
  readMessage1(m) {
    if (this.#initiator) throw new Error("only the responder reads message 1");
    if (m.length < 32) throw new Error("message 1 too short");
    this.#re = m.subarray(0, 32);
    this.#ss.mixHash(this.#re);
    return this.#ss.decryptAndHash(m.subarray(32));
  }

  // ← e, ee, s, es   (`payload` may be a function of h as it stands when the payload is encrypted)
  writeMessage2(payload = EMPTY) {
    const e = this.#ephemeral();
    this.#ss.mixHash(e.pub);
    this.#ss.mixKey(dh(e, this.#re));
    const s = this.#ss.encryptAndHash(this.#s.pub);
    this.#ss.mixKey(dh(this.#s, this.#re));
    const p = typeof payload === "function" ? payload(this.#ss.h) : payload;
    if (p && typeof p.then === "function") return p.then((x) => concat(e.pub, s, this.#ss.encryptAndHash(x)));
    return concat(e.pub, s, this.#ss.encryptAndHash(p));
  }
  /** Returns { payload, hBefore }: the payload and the hash it was encrypted under. */
  readMessage2(m) {
    if (m.length < 32 + 48) throw new Error("message 2 too short");
    this.#re = m.subarray(0, 32);
    this.#ss.mixHash(this.#re);
    this.#ss.mixKey(dh(this.#e, this.#re));
    this.#rs = this.#ss.decryptAndHash(m.subarray(32, 80));
    this.#ss.mixKey(dh(this.#e, this.#rs));
    const hBefore = this.#ss.h;
    return { payload: this.#ss.decryptAndHash(m.subarray(80)), hBefore };
  }

  // → s, se   (a payload function may return a promise: a signature the browser makes; then so does this)
  writeMessage3(payload = EMPTY) {
    const s = this.#ss.encryptAndHash(this.#s.pub);
    this.#ss.mixKey(dh(this.#s, this.#re));
    const p = typeof payload === "function" ? payload(this.#ss.h) : payload;
    if (p && typeof p.then === "function") return p.then((x) => concat(s, this.#ss.encryptAndHash(x)));
    return concat(s, this.#ss.encryptAndHash(p));
  }
  readMessage3(m) {
    if (m.length < 48) throw new Error("message 3 too short");
    this.#rs = this.#ss.decryptAndHash(m.subarray(0, 48));
    this.#ss.mixKey(dh(this.#e, this.#rs));
    const hBefore = this.#ss.h;
    return { payload: this.#ss.decryptAndHash(m.subarray(48)), hBefore };
  }

  /** [send, recv] cipher states for this side. */
  split() {
    const [c1, c2] = this.#ss.split();
    return this.#initiator ? [c1, c2] : [c2, c1];
  }
}

/* ------------------------- identity binding ---------------------------- */

/** The payload each side sends with its static key: who it is, and proof over the transcript. */
function identityPayload(identity, h) {
  const done = (sig) => enc.encode(JSON.stringify({ dap_id: identity.dap_id, public_key: identity.public_key, sig: toHex(sig) }));
  if (typeof identity.sign !== "function") return done(ed25519.sign(h, fromHex(identity.seed)));
  const sig = identity.sign(h);
  return sig && typeof sig.then === "function" ? sig.then(done) : done(sig);
}

function verifyIdentityPayload(payload, h) {
  let p;
  try {
    p = JSON.parse(dec.decode(payload));
  } catch {
    throw new Error("peer identity payload is not JSON");
  }
  if (!p || typeof p.dap_id !== "string" || typeof p.public_key !== "string" || typeof p.sig !== "string") throw new Error("peer identity payload incomplete");
  if (!/^[0-9a-f]{64}$/.test(p.public_key) || fingerprint(p.public_key) !== p.dap_id) throw new Error("peer dap_id is not the fingerprint of its key");
  let ok = false;
  try {
    ok = ed25519.verify(fromHex(p.sig), h, fromHex(p.public_key));
  } catch {
    ok = false;
  }
  if (!ok) throw new Error("peer signature over the handshake does not verify");
  return { dap_id: p.dap_id, public_key: p.public_key };
}

/**
 * The DAP handshake: Noise XX with each side's DAP identity bound into the payloads.
 *   initiator: m1 = writeMessage1(); peer = readMessage2(m2); m3 = await writeMessage3(); session = finish()
 *   responder: readMessage1(m1); m2 = await writeMessage2(); peer = readMessage3(m3); session = finish()
 * (writeMessage2 and 3 return a promise only when the identity signs through the browser.)
 */
export class Handshake {
  #core;
  #identity;
  #peer = null;
  #done = false;
  constructor(identity, { initiator }) {
    this.#identity = identity;
    this.#core = new NoiseXX({ initiator });
  }
  get peer() {
    return this.#peer;
  }
  writeMessage1() {
    return this.#core.writeMessage1();
  }
  readMessage1(m) {
    this.#core.readMessage1(m);
  }
  writeMessage2() {
    return this.#core.writeMessage2((h) => identityPayload(this.#identity, h));
  }
  readMessage2(m) {
    const { payload, hBefore } = this.#core.readMessage2(m);
    return (this.#peer = verifyIdentityPayload(payload, hBefore));
  }
  writeMessage3() {
    return this.#core.writeMessage3((h) => identityPayload(this.#identity, h));
  }
  readMessage3(m) {
    const { payload, hBefore } = this.#core.readMessage3(m);
    return (this.#peer = verifyIdentityPayload(payload, hBefore));
  }
  finish() {
    if (this.#done) throw new Error("handshake already finished");
    if (!this.#peer) throw new Error("handshake incomplete");
    this.#done = true;
    const [send, recv] = this.#core.split();
    return new SecureSession(send, recv, this.#peer, this.#core.h);
  }
}

/** Encrypts and decrypts DAP lines. One base64 line on the wire per message. */
export class SecureSession {
  #send;
  #recv;
  constructor(send, recv, peer, handshakeHash) {
    this.#send = send;
    this.#recv = recv;
    this.peer = peer; // { dap_id, public_key }: who is on the other end, proven
    this.handshakeHash = handshakeHash;
  }
  encryptLine(text) {
    return toBase64(this.#send.encrypt(EMPTY, enc.encode(text)));
  }
  decryptLine(b64) {
    return dec.decode(this.#recv.decrypt(EMPTY, fromBase64(b64)));
  }
  /** Raw bytes (file content): one base64 line per chunk of at most MAX_CHUNK bytes. */
  encryptBytes(buf) {
    if (buf.length > MAX_CHUNK) throw new Error(`chunk > ${MAX_CHUNK} bytes`);
    return toBase64(this.#send.encrypt(EMPTY, buf));
  }
  decryptBytes(b64) {
    return this.#recv.decrypt(EMPTY, fromBase64(b64));
  }
}

export const handshakeLine = (n, m) => JSON.stringify({ noise: n, m: toBase64(m) });

/** Parse a handshake line; null if the line is not one. */
export function parseHandshakeLine(line, expected) {
  let obj;
  try {
    obj = JSON.parse(line);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object" || obj.noise !== expected || typeof obj.m !== "string") return null;
  try {
    return fromBase64(obj.m);
  } catch {
    return null;
  }
}
