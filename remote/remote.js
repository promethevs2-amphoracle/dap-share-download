/* DAP-Share, the page at /remote/. Copyright (c) 2026 Spiridon Iconomou. All rights reserved. */
/*
 * The page at /remote/ (docs/REMOTE.md §5): the owner's phone as a remote for their agent. This is
 * the part that is the page itself. It keeps the phone's key and the pairing in IndexedDB, shows
 * what to do until the phone is connected (scan the code on the computer, compare four digits,
 * say yes there), and then lets the screen (screen.js, the same screen the agent serves) ask
 * through the owner's channel instead of http: window.DAP_TRANSPORT.
 *
 * Everything that is not the page (the pairing code, the channel, the line that is kept open,
 * files) is web/remote-core.js, loaded with a dynamic import so that a phone too old for it is
 * told so. Nothing here knows a relay: the pairing code says which one the computer uses.
 *
 * A classic script, written for older browsers than the modules need, so that it at least starts
 * and can say what is missing. Text is Swedish with an English table, as in the screen. Nothing
 * that comes from the computer or from a file is ever put into the page as markup.
 */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  // ---- language: as the screen chooses it. ?lang=sv|en wins and is remembered; otherwise the browser's. ----
  var LANG = (function () {
    var l = null;
    try {
      var m = /[?&]lang=(sv|en)\b/.exec(location.search);
      if (m) { l = m[1]; localStorage.setItem("dap_lang", l); } else l = localStorage.getItem("dap_lang");
    } catch (e) { l = null; }
    if (l !== "sv" && l !== "en") l = /^sv\b/i.test(navigator.language || "") ? "sv" : "en";
    return l;
  })();
  var LOCALE = LANG === "en" ? "en-GB" : "sv-SE";
  var EN = {
    "Startar …": "Starting …",
    "Din telefon som fjärrkontroll": "Your phone as a remote",
    "Här når du DAP-Share på din dator, var du än är: samma skärm som på datorn, krypterat hela vägen. Bara en telefon du själv har sagt ja till på datorn kommer in.": "Here you reach DAP-Share on your computer from anywhere: the same screen as on the computer, encrypted all the way. Only a phone you have said yes to on the computer gets in.",
    "Lägg sidan på hemskärmen först": "Put this page on your Home Screen first",
    "Tryck på Dela-knappen i Safari (fyrkanten med pilen).": "Tap the Share button in Safari (the square with the arrow).",
    "Välj Lägg till på hemskärmen.": "Choose Add to Home Screen.",
    "Öppna DAP-Share från hemskärmen och anslut där.": "Open DAP-Share from the Home Screen and connect there.",
    "Ikonen på hemskärmen har sitt eget minne. En anslutning du gör här i webbläsaren följer inte med dit.": "The icon on the Home Screen has a memory of its own. A connection you make here in the browser does not follow it there.",
    "På Android: webbläsarens meny, sedan Lägg till på startskärmen.": "On Android: the browser's menu, then Add to Home screen.",
    "Så ansluter du": "How to connect",
    "På datorn: öppna DAP-Share, gå till Inställningar och tryck Anslut en telefon under Din telefon, var du än är.": "On the computer: open DAP-Share, go to Settings and press Connect a phone under Your phone, from anywhere.",
    "Här: tryck Skanna koden på min dator och rikta kameran mot koden.": "Here: tap Scan the code on my computer and point the camera at the code.",
    "Jämför de fyra siffrorna och svara på datorn.": "Compare the four digits and answer on the computer.",
    "Vad telefonen ska heta på datorn": "What the phone is called on the computer",
    "Skanna koden på min dator": "Scan the code on my computer",
    "…eller klistra in koden som text": "…or paste the code as text",
    "Anslut": "Connect",
    "Rikta kameran mot koden på datorns skärm": "Point the camera at the code on the computer's screen",
    "Du öppnade koden med telefonens egen kamera. Den är inte använd, och den används inte härifrån adressen: tryck Skanna koden på min dator och skanna den en gång till, här i sidan.": "You opened the code with the phone's own camera. It has not been used, and it is not used from the address: tap Scan the code on my computer and scan it once more, here in the page.",
    "Det där var ingen anslutningskod. Koden visas på datorn: Inställningar, Din telefon, var du än är, Anslut en telefon.": "That was not a connection code. The code is shown on the computer: Settings, Your phone, from anywhere, Connect a phone.",
    "Koden kommer från en nyare DAP-Share än den här sidan känner till. Ladda om sidan och försök igen.": "The code comes from a newer DAP-Share than this page knows. Reload the page and try again.",
    "Koden gäller inte längre. Den fungerar en gång, i fem minuter. Tryck Anslut en telefon på datorn för en ny.": "The code no longer works. It works once, for five minutes. Press Connect a phone on the computer for a new one.",
    "Du svarade nej på datorn. Telefonen är inte ansluten.": "You answered no on the computer. The phone is not connected.",
    "Ingen svarade på datorn inom två minuter. Tryck Anslut en telefon på datorn för en ny kod och försök igen.": "Nobody answered on the computer within two minutes. Press Connect a phone on the computer for a new code and try again.",
    "Datorn har redan tre telefoner. Ta bort en av dem på datorn först.": "The computer already has three phones. Remove one of them on the computer first.",
    "Datorn svarar inte. Är den vaken, och är DAP-Share igång på den? Försök sedan igen med en ny kod.": "The computer does not answer. Is it awake, and is DAP-Share running on it? Then try again with a new code.",
    "För många försök från det här nätverket just nu. Vänta en minut och försök igen med en ny kod.": "Too many attempts from this network right now. Wait a minute and try again with a new code.",
    "Telefonen når inte reläet. Har telefonen internet? Försök sedan igen med en ny kod.": "The phone cannot reach the relay. Is the phone online? Then try again with a new code.",
    "Den som svarade är inte datorn som koden kom från. Ingenting skickades. Försök med en ny kod.": "Whoever answered is not the computer the code came from. Nothing was sent. Try with a new code.",
    "Webbläsaren sparar ingenting just nu (privat läge?). Då kan telefonen inte komma ihåg datorn.": "The browser keeps nothing right now (private mode?). Then the phone cannot remember the computer.",
    "Ansluter till datorn …": "Connecting to the computer …",
    "Avbryt": "Cancel",
    "Jämför siffrorna": "Compare the digits",
    "Datorn visar nu en fråga med fyra siffror. Är de samma som här: tryck Ja, tillåt på datorn. Är de inte det: tryck Nej där.": "The computer now shows a question with four digits. If they are the same as here: press Yes, allow on the computer. If they are not: press No there.",
    "Väntar på ditt svar på datorn, högst två minuter …": "Waiting for your answer on the computer, two minutes at most …",
    "datorn": "the computer",
    "Ansluter till {name} …": "Connecting to {name} …",
    "Anslutningen till {name} bröts. Ansluter igen …": "The connection to {name} was lost. Connecting again …",
    "Datorn svarar inte": "The computer does not answer",
    "{name} går inte att nå just nu. Den kan sova eller vara avstängd, eller så är DAP-Share inte igång på den. Väck datorn och öppna DAP-Share där, så ansluter telefonen av sig själv.": "{name} cannot be reached right now. It may be asleep or turned off, or DAP-Share is not running on it. Wake the computer and open DAP-Share there, and the phone connects by itself.",
    "För många försök": "Too many attempts",
    "Reläet har fått för många försök från det här nätverket på kort tid. Adressen delas ofta av flera. Telefonen väntar och försöker igen.": "The relay has had too many attempts from this network in a short time. The address is often shared by several people. The phone waits and tries again.",
    "Ingen anslutning": "No connection",
    "Telefonen når inte reläet. Kontrollera att telefonen har internet.": "The phone cannot reach the relay. Check that the phone is online.",
    "Fel dator svarade": "The wrong computer answered",
    "Den som svarar har inte den nyckel som telefonen känner som {name}. Ingenting har skickats. Händer det igen: glöm den här datorn och anslut på nytt från datorns skärm.": "Whoever answers does not hold the key this phone knows as {name}. Nothing has been sent. If it happens again: forget this computer and connect anew from the computer's screen.",
    "Telefonens nyckel går inte att läsa": "The phone's key cannot be read",
    "Webbläsaren ger inte sidan dess sparade nyckel just nu. Stäng sidan och öppna den igen.": "The browser does not give the page its stored key right now. Close the page and open it again.",
    "Försöker igen om {n} s.": "Trying again in {n} s.",
    "Försöker igen …": "Trying again …",
    "Försök nu": "Try now",
    "Inte längre en fjärrkontroll": "No longer a remote",
    "Den här telefonen är inte längre en fjärrkontroll för {name}: den togs bort på datorn. Vill du ansluta den igen trycker du Anslut en telefon på datorn och skannar den nya koden.": "This phone is no longer a remote for {name}: it was removed on the computer. To connect it again, press Connect a phone on the computer and scan the new code.",
    "OK": "OK",
    "Glöm den här datorn": "Forget this computer",
    "Glömma {name}? Telefonen ansluter inte igen förrän du skannar en ny kod. Datorn har kvar telefonen i sin lista tills du tar bort den där: Inställningar, Din telefon, var du än är, Ta bort.": "Forget {name}? The phone does not connect again until you scan a new code. The computer keeps the phone in its list until you remove it there: Settings, Your phone, from anywhere, Remove.",
    "Ja, glöm": "Yes, forget",
    "Den här telefonen": "This phone",
    "Det här behöver en nyare telefon": "This needs a newer phone",
    "Sidan använder kryptering som den här telefonens webbläsare inte klarar. Uppdatera telefonens system och försök igen.": "The page uses encryption that this phone's browser cannot run. Update the phone's system and try again.",
    "Sidan kom inte igång": "The page did not start",
    "Kontrollera att telefonen har internet och ladda om sidan. Hjälper inte det behöver sidan en nyare telefon: uppdatera telefonens system.": "Check that the phone is online and reload the page. If that does not help, the page needs a newer phone: update the phone's system.",
    "Sidan måste öppnas med https. Öppna dapshare.app/remote.": "The page must be opened over https. Open dapshare.app/remote.",
    "Sidan visas inuti en annan sida, och där används den inte: ett tryck där vore ditt eget tryck på en skärm du inte ser. Öppna dapshare.app/remote direkt.": "The page is shown inside another page, and it is not used there: a press there would be your own press on a screen you cannot see. Open dapshare.app/remote directly.",
    "Ladda om": "Reload",
    "Datorn svarade inte. Försök igen.": "The computer did not answer. Try again.",
    "Filer på datorn": "Files on the computer",
    "Spara till telefonen, eller skicka en fil till datorn.": "Save to your phone, or send a file to the computer.",
    "Tillbaka": "Back",
    "Skicka en fil till datorn": "Send a file to the computer",
    "Till delningsmappen": "To the share folder",
    "Filen hamnar i din delningsmapp på {name}. Högst {max} per fil. Ser dina vänner delningsmappen, så ser de också filen.": "The file lands in your share folder on {name}. At most {max} per file. If your friends see the share folder, they see the file too.",
    "Till biblioteket": "To the library",
    "Din AI-agent väljer ur biblioteket åt dina vänner, och kan dela det den väljer.": "Your AI agent picks from the library for your friends, and may share what it picks.",
    "Datorn har varken delningsmapp eller bibliotek att lägga en fil i.": "The computer has neither a share folder nor a library to put a file in.",
    "Välj filer": "Choose files",
    "Mottaget": "Received",
    "Det du har släppt in på datorn.": "What you have let in on the computer.",
    "Delningsmappen": "The share folder",
    "Det som ligger i din delningsmapp på datorn.": "What is in your share folder on the computer.",
    "Biblioteket": "The library",
    "Det din AI-agent väljer ur åt dina vänner.": "What your AI agent picks from for your friends.",
    "Uppdatera": "Refresh",
    "hämtar listan …": "getting the list …",
    "Tomt.": "Empty.",
    "Listan gick inte att hämta.": "The list could not be fetched.",
    "Spara till telefonen": "Save to phone",
    "Ta bort": "Remove",
    "Ta bort {name} från datorn?": "Remove {name} from the computer?",
    "Ja, ta bort": "Yes, remove",
    "Nej": "No",
    "Flyttad till papperskorgen på {name}.": "Moved to the Trash on {name}.",
    "Flyttad till DAP-Shares egen papperskorg på {name}.": "Moved to DAP-Share's own trash on {name}.",
    "Den ligger i mappen {folder} på datorn.": "It is in the folder {folder} on the computer.",
    "Datorn svarade inte. Filen kan vara borta eller ligga kvar: titta i listan.": "The computer did not answer. The file may be gone or still there: look at the list.",
    "Datorn kunde inte säga hur det gick. Filen kan vara borta eller ligga kvar: titta i listan.": "The computer could not say how it went. The file may be gone or still there: look at the list.",
    "Tar bort {name} …": "Removing {name} …",
    "En fil håller på att tas bort: det görs om datorn svarar igen inom två minuter.": "A file is being removed: that is done if the computer answers again within two minutes.",
    "Datorn har en äldre DAP-Share, som inte lägger filer i biblioteket. Ingenting skickades. Uppdatera DAP-Share på datorn.": "The computer has an older DAP-Share, which does not put files in the library. Nothing was sent. Update DAP-Share on the computer.",
    "större än {max}: kan inte hämtas hit": "larger than {max}: cannot be fetched here",
    "Hämtar från datorn …": "Fetching from the computer …",
    "Skickar till datorn …": "Sending to the computer …",
    "väntar på sin tur": "waiting for its turn",
    "{a} av {b}": "{a} of {b}",
    "Hela filen är hämtad. Tryck för att spara den på telefonen.": "The whole file has been fetched. Tap to save it on the phone.",
    "Spara eller dela": "Save or share",
    "Ladda ner": "Download",
    "Framme på datorn, i delningsmappen, som {name}.": "Arrived on the computer, in the share folder, as {name}.",
    "Framme på datorn, i biblioteket, som {name}.": "Arrived on the computer, in the library, as {name}.",
    "Datorn tar emot det sista …": "The computer is taking in the last of it …",
    "Avbrutet. Ingenting sparades.": "Stopped. Nothing was saved.",
    "Anslutningen bröts i sista stund. Filen kan ha kommit fram: titta i listan över delningsmappen innan du skickar den igen.": "The connection was lost at the very end. The file may have arrived: look in the list of the share folder before you send it again.",
    "Anslutningen bröts i sista stund. Filen kan ha kommit fram: titta i listan över biblioteket innan du skickar den igen.": "The connection was lost at the very end. The file may have arrived: look in the list of the library before you send it again.",
    "Läggs på plats …": "Being put in place …",
    "Sidan kom inte hela vägen fram. Kontrollera att telefonen har internet och ladda om sidan.": "The page did not arrive whole. Check that the phone has internet and reload the page.",
    "Håll sidan öppen tills det är klart.": "Keep the page open until it is done.",
    "Filen finns inte kvar på datorn.": "The file is no longer on the computer.",
    "Datorn sa nej: ": "The computer said no: ",
    "Filen är större än {max}.": "The file is larger than {max}.",
    "Filen är tom.": "The file is empty.",
    "Överföringen bröts innan filen var hel. Ingenting sparades. Försök igen.": "The transfer was cut before the file was whole. Nothing was saved. Try again.",
    "En fil i taget: vänta tills den förra är klar.": "One file at a time: wait until the one before is done.",
    "Telefonen kunde inte läsa filen.": "The phone could not read the file.",
    "Datorn går inte att nå just nu.": "The computer cannot be reached right now.",
    "Det gick inte ({code}).": "It did not work ({code}).",
    "Telefon": "Phone",
    "English": "Svenska"
  };
  /** Marks a Swedish text that is translated where it is shown, so that every text of the page is written as a literal handed to t or to N. */
  var N = function (sv) { return sv; };
  function t(sv, vars) {
    var out = LANG === "en" && EN[sv] !== undefined ? EN[sv] : sv;
    if (vars) for (var k in vars) out = out.split("{" + k + "}").join(vars[k]);
    return out;
  }

  /** An element with text and children; never markup from a string. */
  function el(tag, props, kids) {
    var e = document.createElement(tag);
    var k;
    if (props) for (k in props) {
      if (k === "text") e.textContent = props[k];
      else if (k === "click") e.addEventListener("click", props[k]);
      else if (k === "class") e.className = props[k];
      else if (props[k] !== false && props[k] != null) e.setAttribute(k, props[k] === true ? "" : props[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  var p = function (text, cls) { return el("p", { text: text, class: cls || null }); };
  var kb = function (n) { return n < 1024 ? n + " B" : n < 1048576 ? Math.round(n / 1024) + " kB" : (n / 1048576).toFixed(1).replace(/\.0$/, "") + " MB"; };

  var cover = $("remote");
  var body = $("remoteBody");
  var filesBox = $("remoteFiles");
  var core = null;    // web/remote-core.js, once it has loaded
  var remote = null;  // the remote it makes: the pairing, the main line, files
  var screen = null;  // window.dapShare, once screen.js has run
  var tick = null;    // the clock that counts down to the next attempt

  /** While the cover or the files are in front, the screen behind them is put away: it is not scrolled to or tabbed into. */
  function covered() {
    document.body.classList.toggle("rcovered", !cover.hidden || !filesBox.hidden);
  }
  function show(kids) {
    clearInterval(tick);
    tick = null;
    while (body.firstChild) body.removeChild(body.firstChild);
    kids.forEach(function (c) { if (c) body.appendChild(c); });
    cover.hidden = false;
    cover.scrollTop = 0;
    covered();
  }
  // The first act: the line that time alone would have shown (remote.html) is taken away.
  show([p(t("Startar …"), "rwait")]);

  // ---- a pairing code in the address: a camera app opened the QR code as a link, or somebody sent
  // the owner a link that looks like one. It is taken out of the address at once (so that it is not
  // kept in the history or in a Home Screen icon) and it is not used: a computer is only ever
  // connected to by a code the owner scans or pastes here, in the page. ----
  var pasted = "";
  var fromCamera = false;
  function takeFromAddress(address) {
    var at = String(address || "").indexOf("#");
    var h = at === -1 ? "" : String(address).slice(at + 1);
    if (!/^1\.[A-Za-z0-9_-]{43}\./.test(h)) return false;
    fromCamera = true;
    try { if (location.hash) history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* the address stays; nothing else depends on it */ }
    return true;
  }
  takeFromAddress(location.href);
  // The same when the page was open already and only the part after the # changed.
  window.addEventListener("hashchange", function (ev) {
    if (takeFromAddress(ev.newURL) && remote && remote.state.phase === "none") firstScreen(remote.state.why);
  });

  // ---- what the phone calls itself on the computer's screen ----
  var apple = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var standalone = navigator.standalone === true || !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
  var phoneName = (function () {
    var kept = null;
    try { kept = localStorage.getItem("dap_remote_name"); } catch (e) { kept = null; }
    if (kept) return kept.slice(0, 40);
    var ua = navigator.userAgent;
    return /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) || (apple && !/iPhone|iPod/.test(ua)) ? "iPad" : /Android/.test(ua) ? "Android" : t("Telefon");
  })();
  function setName(v) {
    phoneName = String(v || "").trim().slice(0, 40);
    try { localStorage.setItem("dap_remote_name", phoneName); } catch (e) { /* asked again next time */ }
  }

  // ---- what is kept: the phone's key and the pairing, in IndexedDB (a key the page cannot read out is stored as it is) ----
  var db = null;
  function openDb() {
    if (!db) {
      db = new Promise(function (resolve, reject) {
        var r;
        try { r = indexedDB.open("dap-share-remote", 1); } catch (e) { return reject(e); }
        r.onupgradeneeded = function () { r.result.createObjectStore("kept"); };
        r.onsuccess = function () { resolve(r.result); };
        r.onerror = function () { reject(r.error || new Error("IndexedDB")); };
        r.onblocked = function () { reject(new Error("IndexedDB is blocked")); };
      });
      db.catch(function () { db = null; }); // asked again the next time something is kept
    }
    return db;
  }
  function inStore(mode, fn) {
    return openDb().then(function (d) {
      return new Promise(function (resolve, reject) {
        var tx = d.transaction("kept", mode);
        var rq = fn(tx.objectStore("kept"));
        tx.oncomplete = function () { resolve(rq.result); }; // when it is really written, not when it was asked for
        tx.onerror = tx.onabort = function () { reject(tx.error || rq.error || new Error("IndexedDB")); };
      });
    });
  }
  var storage = {
    get: function (key) { return inStore("readonly", function (s) { return s.get(key); }); },
    set: function (key, value) { return inStore("readwrite", function (s) { return s.put(value, key); }).then(function () {}); },
    delete: function (key) { return inStore("readwrite", function (s) { return s.delete(key); }).then(function () {}); }
  };

  // ---- the door the screen asks through (docs/REMOTE.md §5). It is set before the screen's script
  // starts, so the screen never fetches anything; while there is no line, a question fails at once. ----
  window.DAP_TRANSPORT = function (method, name, what) {
    if (remote) return remote.transport(method, name, what);
    var e = new Error("the page is still starting");
    e.code = "not-connected";
    e.remote = true;
    return Promise.reject(e);
  };
  // ---- the three folders at the top of the screen (docs/SCREEN.md §1). A phone has no Finder to show
  // the computer's folders in: a press there opens this page's own view of the files on the
  // computer, at that place. Set before the screen's script starts, as the door above is. ----
  window.DAP_FOLDER = function (place) { openFiles(String(place)); };
  // A question the screen asked when the line went away: said in a word, not left as an error nobody sees.
  window.addEventListener("unhandledrejection", function (ev) {
    if (!ev.reason || ev.reason.remote !== true) return;
    ev.preventDefault();
    if (screen && remote && remote.state.phase === "connected") screen.toast(t("Datorn svarade inte. Försök igen."));
  });

  // ---- forgetting the computer: asked twice, as the screen asks before it removes a phone ----
  function reload() { location.reload(); }
  function forgetControl(name) {
    var box = el("div", { class: "rforget" });
    var first = el("button", { class: "quiet tiny", type: "button", text: t("Glöm den här datorn"), click: function () {
      first.hidden = true;
      sure.hidden = false;
    } });
    var sure = el("div", { hidden: true }, [
      el("p", { class: "small", text: t("Glömma {name}? Telefonen ansluter inte igen förrän du skannar en ny kod. Datorn har kvar telefonen i sin lista tills du tar bort den där: Inställningar, Din telefon, var du än är, Ta bort.", { name: name || t("datorn") }) }),
      el("div", { class: "rbtns" }, [
        el("button", { class: "danger tiny", type: "button", "data-forget-yes": "1", text: t("Ja, glöm"), click: function () {
          // The page starts over: the screen behind the cover must not keep showing the computer that was forgotten.
          if (remote) remote.forget().then(reload, reload);
        } }),
        el("button", { class: "quiet tiny", type: "button", text: t("Avbryt"), click: function () { sure.hidden = true; first.hidden = false; } })
      ])
    ]);
    box.appendChild(first);
    box.appendChild(sure);
    return box;
  }

  // ---- the first screen: no computer yet ----
  var WHY = {
    "not-a-code": N("Det där var ingen anslutningskod. Koden visas på datorn: Inställningar, Din telefon, var du än är, Anslut en telefon."),
    "newer-code": N("Koden kommer från en nyare DAP-Share än den här sidan känner till. Ladda om sidan och försök igen."),
    unknown: N("Koden gäller inte längre. Den fungerar en gång, i fem minuter. Tryck Anslut en telefon på datorn för en ny."),
    declined: N("Du svarade nej på datorn. Telefonen är inte ansluten."),
    expired: N("Ingen svarade på datorn inom två minuter. Tryck Anslut en telefon på datorn för en ny kod och försök igen."),
    full: N("Datorn har redan tre telefoner. Ta bort en av dem på datorn först."),
    unreachable: N("Datorn svarar inte. Är den vaken, och är DAP-Share igång på den? Försök sedan igen med en ny kod."),
    "slow-down": N("För många försök från det här nätverket just nu. Vänta en minut och försök igen med en ny kod."),
    "no-connection": N("Telefonen når inte reläet. Har telefonen internet? Försök sedan igen med en ny kod."),
    mismatch: N("Den som svarade är inte datorn som koden kom från. Ingenting skickades. Försök med en ny kod."),
    storage: N("Webbläsaren sparar ingenting just nu (privat läge?). Då kan telefonen inte komma ihåg datorn.")
  };
  function connect(text) {
    var code = String(text || "").trim();
    if (!code || !remote) return;
    pasted = "";
    fromCamera = false;
    remote.pair(code).then(function () {
      // Asked once the phone is a remote: that the browser does not clear what the page keeps when space runs short.
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {}); } catch (e) { /* not offered here */ }
    }, function () { /* the state says why, and the first screen shows it */ });
  }
  function scan() {
    if (!screen) return;
    var hint = $("scanHint");
    var was = hint.textContent;
    var back = function () { hint.textContent = was; $("scanClose").removeEventListener("click", back); };
    hint.textContent = t("Rikta kameran mot koden på datorns skärm");
    $("scanClose").addEventListener("click", back);
    screen.startScan(function (text) { back(); connect(text); });
  }
  function firstScreen(why) {
    var nameIn = el("input", { id: "remoteName", maxlength: "40", autocomplete: "off", value: phoneName });
    nameIn.addEventListener("input", function () { setName(nameIn.value); });
    var codeIn = el("input", { id: "remoteCode", autocomplete: "off", autocapitalize: "off", spellcheck: "false", placeholder: t("…eller klistra in koden som text"), value: pasted });
    codeIn.addEventListener("input", function () { pasted = codeIn.value; });
    codeIn.addEventListener("keydown", function (e) { if (e.key === "Enter") connect(codeIn.value); });
    show([
      el("h2", { text: t("Din telefon som fjärrkontroll") }),
      p(t("Här når du DAP-Share på din dator, var du än är: samma skärm som på datorn, krypterat hela vägen. Bara en telefon du själv har sagt ja till på datorn kommer in.")),
      why && WHY[why] ? el("div", { class: "rcard rwhy", id: "remoteWhy", "data-why": why }, [p(t(WHY[why]))]) : null,
      fromCamera ? el("div", { class: "rcard rwhy", id: "remoteFromCamera" }, [p(t("Du öppnade koden med telefonens egen kamera. Den är inte använd, och den används inte härifrån adressen: tryck Skanna koden på min dator och skanna den en gång till, här i sidan."))]) : null,
      // Safari and the Home Screen icon keep separate storage: the pairing is made where it will be used.
      standalone ? null : el("div", { class: "rcard rfirst", id: "remoteHome" }, [
        el("h3", { text: t("Lägg sidan på hemskärmen först") }),
        el("ol", null, [
          el("li", { text: t("Tryck på Dela-knappen i Safari (fyrkanten med pilen).") }),
          el("li", { text: t("Välj Lägg till på hemskärmen.") }),
          el("li", { text: t("Öppna DAP-Share från hemskärmen och anslut där.") })
        ]),
        el("p", { class: "small", text: t("Ikonen på hemskärmen har sitt eget minne. En anslutning du gör här i webbläsaren följer inte med dit.") }),
        apple ? null : el("p", { class: "small", text: t("På Android: webbläsarens meny, sedan Lägg till på startskärmen.") })
      ]),
      el("div", { class: "rcard" }, [
        el("h3", { text: t("Så ansluter du") }),
        el("ol", null, [
          el("li", { text: t("På datorn: öppna DAP-Share, gå till Inställningar och tryck Anslut en telefon under Din telefon, var du än är.") }),
          el("li", { text: t("Här: tryck Skanna koden på min dator och rikta kameran mot koden.") }),
          el("li", { text: t("Jämför de fyra siffrorna och svara på datorn.") })
        ])
      ]),
      el("label", { class: "fld" }, [el("span", { class: "small", text: t("Vad telefonen ska heta på datorn") }), nameIn]),
      el("button", { class: "big", type: "button", id: "remoteScan", text: t("Skanna koden på min dator"), click: scan }),
      el("div", { class: "rpaste" }, [codeIn, el("button", { class: "quiet", type: "button", id: "remoteConnect", text: t("Anslut"), click: function () { connect(codeIn.value); } })]),
      el("p", { class: "rfoot" }, [el("a", { href: "?lang=" + (LANG === "en" ? "sv" : "en"), text: t("English") })])
    ]);
  }

  // ---- what is wrong, in plain words, and when the next attempt is ----
  function failure(s) {
    var name = s.name || t("datorn");
    var texts = s.why === "storage"
      ? [N("Telefonens nyckel går inte att läsa"), N("Webbläsaren ger inte sidan dess sparade nyckel just nu. Stäng sidan och öppna den igen.")]
      : s.phase === "slow-down" ? [N("För många försök"), N("Reläet har fått för många försök från det här nätverket på kort tid. Adressen delas ofta av flera. Telefonen väntar och försöker igen.")]
      : s.phase === "no-connection" ? [N("Ingen anslutning"), N("Telefonen når inte reläet. Kontrollera att telefonen har internet.")]
      : s.phase === "mismatch" ? [N("Fel dator svarade"), N("Den som svarar har inte den nyckel som telefonen känner som {name}. Ingenting har skickats. Händer det igen: glöm den här datorn och anslut på nytt från datorns skärm.")]
      : [N("Datorn svarar inte"), N("{name} går inte att nå just nu. Den kan sova eller vara avstängd, eller så är DAP-Share inte igång på den. Väck datorn och öppna DAP-Share där, så ansluter telefonen av sig själv.")];
    var next = el("p", { class: "small", id: "remoteNext" });
    var count = function () {
      var left = Math.ceil((s.retryAt - Date.now()) / 1000);
      next.textContent = left > 0 ? t("Försöker igen om {n} s.", { n: left }) : t("Försöker igen …");
    };
    show([
      el("h2", { text: t(texts[0]), id: "remoteProblem", "data-phase": s.phase }),
      p(t(texts[1], { name: name })),
      next,
      carriedNote(),
      el("div", { class: "rbtns" }, [el("button", { type: "button", id: "remoteRetry", text: t("Försök nu"), click: function () { if (remote) remote.retryNow(); } })]),
      el("div", { class: "rbtns" }, [forgetControl(name)])
    ]);
    count();
    tick = setInterval(count, 1000);
  }

  /** On the cover while a press on Ja, ta bort waits for the computer: it is asked again when the line is up (§3.1), and the owner is told so. */
  function carriedNote() {
    return removing ? el("p", { class: "small", id: "remoteCarried", text: t("En fil håller på att tas bort: det görs om datorn svarar igen inom två minuter.") }) : null;
  }

  function reveal() {
    if (!screen) return; // the screen's script has not come yet: its loading calls this again
    var done = function () {
      if (!remote || remote.state.phase !== "connected") return;
      cover.hidden = true;
      covered();
    };
    // The screen is asked to draw what the computer says now, and only then is the cover taken away.
    try { Promise.resolve(screen.refresh()).then(done, done); } catch (e) { done(); }
  }

  function onState(s) {
    if (incomplete) return;
    if (s.phase === "connected") {
      clearInterval(tick);
      tick = null;
      // A list that could not be fetched, or a removal nobody could tell the end of, while the
      // line was down: the lists are asked for again now, so "look at the list" has a list.
      if (unsure && !filesBox.hidden) loadLists();
      return reveal();
    }
    if (s.phase === "starting") return show([p(t("Startar …"), "rwait")]);
    if (s.phase === "none") return firstScreen(s.why);
    if (s.phase === "pairing") {
      return show([
        el("h2", { text: t("Jämför siffrorna") }),
        el("div", { class: "rdigits", id: "remoteDigits", text: s.digits }),
        p(t("Datorn visar nu en fråga med fyra siffror. Är de samma som här: tryck Ja, tillåt på datorn. Är de inte det: tryck Nej där.")),
        p(t("Väntar på ditt svar på datorn, högst två minuter …"), "small"),
        el("div", { class: "rbtns" }, [el("button", { class: "quiet", type: "button", id: "remoteCancel", text: t("Avbryt"), click: function () { remote.cancelPairing(); } })])
      ]);
    }
    if (s.phase === "connecting") {
      if (s.pairing) {
        return show([
          p(t("Ansluter till datorn …"), "rwait"),
          el("div", { class: "rbtns" }, [el("button", { class: "quiet", type: "button", id: "remoteCancel", text: t("Avbryt"), click: function () { remote.cancelPairing(); } })])
        ]);
      }
      var name = s.name || t("datorn");
      return show([
        el("p", { class: "rwait", id: "remoteConnecting", text: t(s.lost ? N("Anslutningen till {name} bröts. Ansluter igen …") : N("Ansluter till {name} …"), { name: name }) }),
        carriedNote(),
        el("div", { class: "rbtns" }, [forgetControl(name)])
      ]);
    }
    if (s.phase === "gone") {
      return show([
        el("h2", { text: t("Inte längre en fjärrkontroll"), id: "remoteGone" }),
        p(t("Den här telefonen är inte längre en fjärrkontroll för {name}: den togs bort på datorn. Vill du ansluta den igen trycker du Anslut en telefon på datorn och skannar den nya koden.", { name: s.name || t("datorn") })),
        el("div", { class: "rbtns" }, [el("button", { type: "button", id: "remoteGoneOk", text: t("OK"), click: reload })])
      ]);
    }
    return failure(s); // unreachable, slow-down, no-connection, mismatch
  }

  // ---- files: what is on the computer, to the phone or to the computer's trash; and a file from
  // the phone to the computer's share folder or its library ----
  var working = false; // a file is on its way: one at a time
  var waiting = [];    // files chosen to send, in order, each with the place it is meant for
  var removing = false; // a file is being removed: one at a time, and none while a file is on its way
  var removingRow = null; // ... and its row, which says so until the computer has answered
  var urls = [];       // addresses made for fetched files, given back when their rows go
  var jobsBox = null;
  var listBoxes = {};
  var rows = {};       // the rows of each list, to put a question that was left open away
  var fetching = {};   // how many times each list is being asked for right now: its rows are from before, and nothing in them can be pressed
  var unsure = false;  // a list could not be fetched, or a removal ended with nobody knowing how: asked again when the line is up
  var saidBoxes = {};  // above each list: what became of the file that was last removed there
  var whereBoxes = {}; // the choice of where a file from the phone lands: { label, input } for each place
  var sentTo = [];     // the places files are being sent to: their lists are asked for again when the last one is done
  // What the agent has and knows, as its state says (asked whenever the lists are). Until it
  // has answered, what every agent does: a file from the phone goes to the share folder.
  var can = { share: true, library: false, remove: false };
  var shown = null;    // the place a folder button asked for: kept in view while the lists above it fill
  var CARDS = ["share", "received", "library"]; // the cards and their lists, in the order of the screen's three folders
  var loads = 0;       // how many times the lists have been asked for
  function fileWhy(e, max, place) {
    var code = e && e.code;
    var text;
    // An agent that did not say it would put the file in the library got no byte of it (remote-core.js, upload).
    if (code === "refused" && e.reason === "place") return t("Datorn har en äldre DAP-Share, som inte lägger filer i biblioteket. Ingenting skickades. Uppdatera DAP-Share på datorn.");
    if (code === "refused") return e.status === 404 ? t("Filen finns inte kvar på datorn.") : t("Datorn sa nej: ") + (screen ? screen.trServer(e.message) : e.message);
    if (code === "too-big") return t("Filen är större än {max}.", { max: max });
    if (code === "empty") return t("Filen är tom.");
    if (code === "cut") return t("Överföringen bröts innan filen var hel. Ingenting sparades. Försök igen.");
    if (code === "cancelled") return t("Avbrutet. Ingenting sparades.");
    if (code === "unsure") {
      text = place === "library" ? N("Anslutningen bröts i sista stund. Filen kan ha kommit fram: titta i listan över biblioteket innan du skickar den igen.") : N("Anslutningen bröts i sista stund. Filen kan ha kommit fram: titta i listan över delningsmappen innan du skickar den igen.");
      return t(text);
    }
    if (code === "one-at-a-time") return t("En fil i taget: vänta tills den förra är klar.");
    if (code === "unreadable") return t("Telefonen kunde inte läsa filen.");
    if (e && e.kind) return t("Datorn går inte att nå just nu.");
    return t("Det gick inte ({code}).", { code: String(code || (e && e.message) || e) });
  }
  /** One line in the list of what is being moved: a name, a bar, a word, and what can be pressed. */
  function job(name) {
    var bar = el("i");
    var word = el("div", { class: "small rword", text: t("väntar på sin tur") });
    var btns = el("div", { class: "rbtns" });
    var row = el("div", { class: "rjob", "data-job": name }, [el("b", { text: name }), el("div", { class: "rbar" }, [bar]), word, btns]);
    jobsBox.appendChild(row);
    jobsBox.hidden = false;
    var clear = function () { while (btns.firstChild) btns.removeChild(btns.firstChild); };
    return {
      row: row,
      progress: function (done, size, what) {
        bar.style.width = (size ? Math.floor((done / size) * 100) : 100) + "%";
        word.textContent = what + " " + t("{a} av {b}", { a: kb(done), b: kb(size) }) + ". " + t("Håll sidan öppen tills det är klart.");
      },
      say: function (text) { word.textContent = text; },
      stoppable: function (stop) { clear(); btns.appendChild(el("button", { class: "quiet tiny", type: "button", "data-job-stop": "1", text: t("Avbryt"), click: stop })); },
      unstoppable: function () { clear(); },
      end: function (state, text, more) {
        clear();
        row.setAttribute("data-state", state);
        bar.style.width = state === "done" ? "100%" : bar.style.width;
        word.textContent = text;
        (more || []).forEach(function (b) { if (b) btns.appendChild(b); });
      }
    };
  }
  function clearJobs() {
    if (working || waiting.length) return;
    urls.splice(0).forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) { /* gone already */ } });
    while (jobsBox.firstChild) jobsBox.removeChild(jobsBox.firstChild);
    jobsBox.hidden = true;
  }
  // A phone that locks its screen suspends the page and the file's line ends with it: while a
  // file is on its way the screen is kept on, where the browser can (Safari 16.4 and later).
  var awake = null;
  function keepAwake(on) {
    try {
      if (on && !awake && navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request("screen").then(function (lock) {
          if (working) awake = lock; else lock.release();
        }, function () {});
      } else if (!on && awake) { awake.release(); awake = null; }
    } catch (e) { awake = null; }
  }
  /** One thing at a time: while a file is on its way or one is being removed, no file in the lists can be saved or removed. */
  function busy() { return working || waiting.length > 0 || removing; }
  function freeze() {
    var off = busy();
    CARDS.forEach(function (place) {
      if (!listBoxes[place]) return;
      // (A list that is being asked for again shows what was there before: nothing of that can be pressed.)
      var old = off || fetching[place] > 0;
      [].forEach.call(listBoxes[place].querySelectorAll("button[data-save], button[data-remove], button[data-remove-yes]"), function (b) { b.disabled = old; });
    });
  }
  /** Every question that was left open in a place's rows is put away: Ja, ta bort is only ever pressed after Ta bort, in the same look at the list. */
  function settle(place) {
    (rows[place] || []).forEach(function (row) { if (row !== removingRow) row.back(); });
  }
  /** A place's list is about to be asked for: until it has come, its rows are what was there before. */
  function hold(place) {
    fetching[place] = (fetching[place] || 0) + 1;
    settle(place);
    freeze();
  }
  function setWorking(on) {
    working = on;
    keepAwake(on);
    freeze();
  }
  function fetchFile(place, f) {
    if (busy() || !remote) return;
    clearJobs();
    var max = kb(core.MAX_FILE);
    var j = job(f.name);
    var stop = typeof AbortController === "function" ? new AbortController() : null;
    // A large file is put away a few megabytes at a time, so that the page never holds it twice.
    var parts = [];
    var some = [];
    var held = 0;
    setWorking(true);
    if (stop) j.stoppable(function () { stop.abort(); });
    remote.download({
      place: place, name: f.name, signal: stop ? stop.signal : null,
      onChunk: function (c) { some.push(c); held += c.length; if (held >= 4194304) { parts.push(new Blob(some)); some = []; held = 0; } },
      onProgress: function (got, size) { j.progress(got, size, t("Hämtar från datorn …")); }
    }).then(function () {
      if (some.length) parts.push(new Blob(some));
      // Handed to the phone as a kind it shows without running anything, or as plain bytes (remote-core.js, safeType).
      var blob = new Blob(parts, { type: core.safeType(f.name) });
      var url = URL.createObjectURL(blob);
      urls.push(url);
      var link = el("a", { class: "rsave", href: url, download: f.name, text: t("Ladda ner") });
      var file = null;
      try { file = new File([blob], f.name, { type: blob.type }); } catch (e) { file = null; }
      var share = null;
      try { if (file && navigator.canShare && navigator.canShare({ files: [file] })) share = file; } catch (e) { share = null; }
      j.end("done", t("Hela filen är hämtad. Tryck för att spara den på telefonen."), [
        share ? el("button", { type: "button", "data-job-share": "1", text: t("Spara eller dela"), click: function () {
          navigator.share({ files: [share] }).catch(function (e) { if (!e || e.name !== "AbortError") link.click(); });
        } }) : null,
        link
      ]);
    }, function (e) {
      j.end("failed", fileWhy(e, max));
    }).then(function () { setWorking(false); });
  }
  function sendNext() {
    if (working || !remote) return;
    // All of them have been tried: what is now in the places they were sent to.
    if (!waiting.length) return void sentTo.splice(0).forEach(function (place) { loadList(place); });
    var item = waiting.shift();
    if (sentTo.indexOf(item.place) === -1) sentTo.push(item.place);
    var max = kb(core.MAX_FILE);
    // (A file that is empty or over the ceiling is refused by remote-core.js before any line is opened, and said below.)
    var stop = typeof AbortController === "function" ? new AbortController() : null;
    setWorking(true);
    if (stop) item.job.stoppable(function () { stop.abort(); });
    remote.upload({
      data: item.file, name: item.file.name, place: item.place, signal: stop ? stop.signal : null,
      onProgress: function (sent, size, committed) {
        // Until the phone has said "put it in place" Cancel leaves nothing on the computer;
        // after that it would come too late, so it is no longer offered.
        if (committed) { item.job.unstoppable(); item.job.say(t("Läggs på plats …")); }
        else if (sent >= size) item.job.say(t("Datorn tar emot det sista …"));
        else item.job.progress(sent, size, t("Skickar till datorn …"));
      }
    }).then(function (r) {
      var text = item.place === "library" ? N("Framme på datorn, i biblioteket, som {name}.") : N("Framme på datorn, i delningsmappen, som {name}.");
      item.job.end("done", t(text, { name: r.name }));
    }, function (e) {
      item.job.end("failed", fileWhy(e, max, item.place));
    }).then(function () {
      setWorking(false);
      sendNext();
    });
  }
  /** The card of the place that was asked for, at the top of the view: under the row with Tillbaka, which stays in sight. */
  function bring() {
    if (!shown || filesBox.hidden) return;
    var top = filesBox.querySelector(".rtop");
    var under = top ? top.offsetHeight : 0;
    [].forEach.call(filesBox.querySelectorAll("[data-place]"), function (card) {
      if (card.getAttribute("data-place") === shown) filesBox.scrollTop += card.getBoundingClientRect().top - filesBox.getBoundingClientRect().top - under - 12;
    });
  }
  /** The card that was asked for is marked, so that a press is answered also where nothing can move; no place, no mark. */
  function mark(place) {
    [].forEach.call(filesBox.querySelectorAll("[data-place]"), function (card) { card.classList.toggle("rasked", card.getAttribute("data-place") === place); });
  }
  function closeFiles() {
    filesBox.hidden = true;
    CARDS.forEach(settle); // a question left open does not wait behind the screen for the next time the view is opened
    shown = null;
    covered();
    window.scrollTo(0, 0);
  }
  /** Above a place's list: what became of the file that was last removed there. Its row is gone by then.
   *  Said in the screen's own passing line as well, which is in sight however far down the list the row was. */
  function say(place, state, file, text, more) {
    var box = saidBoxes[place];
    while (box.firstChild) box.removeChild(box.firstChild);
    box.hidden = !state;
    if (!state) return;
    box.setAttribute("data-state", state);
    box.appendChild(el("b", { text: file }));
    box.appendChild(el("div", { class: "small", text: text }));
    if (more) box.appendChild(el("div", { class: "small", text: more }));
    if (screen) screen.toast(file + ": " + text);
  }
  /** Ja, ta bort was pressed (docs/REMOTE.md §3.2): the file goes to a trash on the computer, and the page says which.
   *  What the row showed of the file goes with the question: the computer removes that file, not another that has its name by now. */
  function removeFile(place, f, row) {
    if (busy() || !remote) return;
    var name = (remote.pairing && remote.pairing.name) || t("datorn");
    removing = true;
    removingRow = row;
    freeze();
    row.working(true);
    say(place, null);
    remote.removeFile({ place: place, name: f.name, size: f.size, modified: f.modified }).then(function (r) {
      var text = r.where === "kept" ? N("Flyttad till DAP-Shares egen papperskorg på {name}.") : N("Flyttad till papperskorgen på {name}.");
      say(place, "done", f.name, t(text, { name: name }), r.where === "kept" && r.folder ? t("Den ligger i mappen {folder} på datorn.", { folder: r.folder }) : null);
      return true;
    }, function (e) {
      var code = e && e.code;
      // Refused: the computer says no file was removed. It was not there any more, or not the one the
      // list showed (404), or it is where it was and the computer says why. Unsure: asked, and no
      // answer came, or one that does not say (a fault on the computer after the file had moved, say).
      // Anything else was never asked.
      var text = e && e.status ? N("Datorn kunde inte säga hur det gick. Filen kan vara borta eller ligga kvar: titta i listan.") : N("Datorn svarade inte. Filen kan vara borta eller ligga kvar: titta i listan.");
      say(place, "failed", f.name, code === "refused" ? fileWhy(e) : code === "unsure" ? t(text) : t("Datorn går inte att nå just nu."));
      if (code === "unsure") unsure = true;
      return code === "unsure" || (code === "refused" && e.status === 404);
    }).then(function (changed) {
      var note = $("remoteCarried");
      if (note) note.hidden = true;
      removing = false;
      removingRow = null;
      row.working(false);
      freeze();
      if (changed) loadList(place); // what is there now
      else row.back(); // the computer said the file is where it was, or was never asked: its row is as before the question
    });
  }
  /** One file in a place's list: its name, and what can be done with it. Ta bort asks in the row itself, in place of the buttons, before anything is sent. */
  function fileRow(place, f, max) {
    var when = new Date(f.modified * 1000).toLocaleDateString(LOCALE, { year: "numeric", month: "short", day: "numeric" });
    var over = f.size > core.MAX_FILE;
    var row = {};
    var acts = el("div", { class: "ract" }, [
      over ? null : el("button", { class: "quiet tiny", type: "button", "data-save": f.name, disabled: busy(), text: t("Spara till telefonen"), click: function () { fetchFile(place, f); } }),
      can.remove ? el("button", { class: "quiet tiny", type: "button", "data-remove": f.name, disabled: busy(), text: t("Ta bort"), click: function () { acts.hidden = true; sure.hidden = false; } }) : null
    ]);
    row.no = el("button", { class: "quiet tiny", type: "button", "data-remove-no": f.name, text: t("Nej"), click: function () { row.back(); } });
    var ask = el("p", { class: "small", text: t("Ta bort {name} från datorn?", { name: f.name }) });
    var answers = el("div", { class: "ract" }, [
      el("button", { class: "danger tiny", type: "button", "data-remove-yes": f.name, disabled: busy(), text: t("Ja, ta bort"), click: function () { removeFile(place, f, row); } }),
      row.no
    ]);
    var sure = el("div", { class: "rsure", hidden: true }, [ask, answers]);
    row.back = function () { sure.hidden = true; acts.hidden = false; };
    // While the press is on its way the row says so, in place of the question and its two answers.
    row.working = function (on) {
      ask.textContent = on ? t("Tar bort {name} …", { name: f.name }) : t("Ta bort {name} från datorn?", { name: f.name });
      answers.hidden = on;
      if (on) sure.setAttribute("data-working", "1"); else sure.removeAttribute("data-working");
    };
    rows[place].push(row);
    return el("div", { class: "rfile" }, [
      el("span", { class: "rfname" }, [el("span", { text: f.name }), el("div", { class: "small", text: kb(f.size) + " · " + when + (over ? " · " + t("större än {max}: kan inte hämtas hit", { max: max }) : "") })]),
      acts,
      sure
    ]);
  }
  /** One place's list, asked for now. With held, the caller has already said that it is being asked for. */
  function loadList(place, held) {
    if (!remote || !core) return Promise.resolve();
    var max = kb(core.MAX_FILE);
    var box = listBoxes[place];
    if (!held) hold(place);
    if (!box.firstChild) box.appendChild(el("div", { class: "empty", text: t("hämtar listan …") }));
    var fill = function (r) {
      fetching[place] -= 1;
      while (box.firstChild) box.removeChild(box.firstChild);
      rows[place] = [];
      if (!r || !Array.isArray(r.files)) {
        unsure = true;
        return void box.appendChild(el("div", { class: "empty", text: t("Listan gick inte att hämta.") }));
      }
      if (!r.files.length) return void box.appendChild(el("div", { class: "empty", text: t("Tomt.") }));
      r.files.forEach(function (f) { box.appendChild(fileRow(place, f, max)); });
    };
    // (The rows are made as if nothing else were going on; freeze, right after, turns off what cannot be pressed now.)
    return remote.transport("GET", "files", { place: place }).then(fill, function () { fill(null); }).then(freeze);
  }
  /** The place that is chosen for a file from the phone, or null when the agent has none. */
  function chosen() {
    return core.PUT_PLACES.filter(function (place) { return can[place] && whereBoxes[place].input.checked; })[0] || null;
  }
  /** The choice of where a file from the phone lands: only the places the agent has. The share folder is chosen at the start. */
  function offer() {
    core.PUT_PLACES.forEach(function (place) {
      whereBoxes[place].label.hidden = !can[place];
      if (!can[place]) whereBoxes[place].input.checked = false;
    });
    var first = core.PUT_PLACES.filter(function (place) { return can[place]; })[0];
    if (first && !chosen()) whereBoxes[first].input.checked = true;
    $("remoteSend").disabled = !first;
    $("remoteNowhere").hidden = !!first;
  }
  /** What the agent has and does, from its state: the screen's own question, answered from memory when it was just asked.
   *  The library is offered, and Ta bort, only to an agent that says itself that it puts files there and removes them
   *  (me.files; remote-core.js, filesOf): an older one would put a file meant for the library in the share folder. */
  function learn() {
    return remote.transport("GET", "state", {}).then(function (s) {
      var me = s && s.me;
      if (!me) return;
      can = core.filesOf(me);
    }, function () { /* as it was: the lists say that the computer did not answer */ }).then(offer);
  }
  function loadLists() {
    if (!remote || !core) return;
    var mine = ++loads;
    unsure = false;
    // All of them are from before, from this moment: the last one comes several questions later.
    CARDS.forEach(function (place) { if (core.PLACES.indexOf(place) !== -1) hold(place); });
    learn().then(function () {
      return CARDS.filter(function (place) { return core.PLACES.indexOf(place) !== -1; }).reduce(function (before, place) {
        // (A list that filled above the place that was asked for pushed it down: it is brought up again.)
        return before.then(function () { return loadList(place, true).then(bring); });
      }, Promise.resolve());
    }).then(function () { if (mine === loads) shown = null; });
  }
  function buildFiles() {
    var pick = el("input", { type: "file", id: "remotePick", multiple: true, hidden: true });
    pick.addEventListener("change", function () {
      var picked = [].slice.call(pick.files || []);
      var place = chosen(); // where they go is what was chosen when they were picked
      pick.value = "";
      if (!picked.length || !place) return;
      clearJobs();
      picked.forEach(function (f) { waiting.push({ file: f, job: job(f.name), place: place }); });
      sendNext();
    });
    jobsBox = el("div", { class: "rcard", id: "remoteJobs", hidden: true });
    // Where a file from the phone lands: one of two, each with what it means under it.
    var where = function (key, title, text) {
      var input = el("input", { type: "radio", name: "remoteWhere", value: key, checked: key === "share" });
      var label = el("label", { class: "rwhere", "data-where": key }, [input, el("span", {}, [el("b", { text: t(title) }), text])]);
      whereBoxes[key] = { label: label, input: input };
      return label;
    };
    var place = function (key, title, text) {
      rows[key] = [];
      fetching[key] = 0;
      listBoxes[key] = el("div", { id: "remoteList-" + key });
      saidBoxes[key] = el("div", { class: "rsaid", id: "remoteSaid-" + key, hidden: true });
      return el("div", { class: "rcard", "data-place": key }, [el("h3", { text: t(title) }), el("p", { class: "small", text: t(text) }), saidBoxes[key], listBoxes[key]]);
    };
    // Once the owner moves the view, it is theirs: nothing brings a card back into view after that.
    ["touchstart", "wheel"].forEach(function (name) { filesBox.addEventListener(name, function () { shown = null; }, { passive: true }); });
    // The four icons stay in front of this view: a press on one leaves it, and the screen goes where the icon leads.
    document.addEventListener("click", function (e) {
      if (!filesBox.hidden && e.target.closest && e.target.closest("#tabs button")) closeFiles();
    });
    var texts = {
      share: [N("Delningsmappen"), N("Det som ligger i din delningsmapp på datorn.")],
      received: [N("Mottaget"), N("Det du har släppt in på datorn.")],
      library: [N("Biblioteket"), N("Det din AI-agent väljer ur åt dina vänner.")]
    };
    filesBox.appendChild(el("div", { class: "rfiles" }, [
      // The way back is always in sight: its row stays at the top while the cards move under it.
      el("div", { class: "rtop" }, [el("button", { class: "quiet tiny back", type: "button", id: "remoteFilesBack", text: t("Tillbaka"), click: closeFiles })]),
      el("h2", { text: t("Filer på datorn") }),
      jobsBox,
      el("div", { class: "rcard" }, [
        el("h3", { text: t("Skicka en fil till datorn") }),
        el("div", { id: "remoteWhere" }, [
          where("share", N("Till delningsmappen"), el("span", { class: "small", id: "remoteSendText" })),
          where("library", N("Till biblioteket"), el("span", { class: "small", id: "remoteLibraryText", text: t("Din AI-agent väljer ur biblioteket åt dina vänner, och kan dela det den väljer.") }))
        ]),
        el("p", { class: "small", id: "remoteNowhere", hidden: true, text: t("Datorn har varken delningsmapp eller bibliotek att lägga en fil i.") }),
        pick,
        el("button", { type: "button", id: "remoteSend", text: t("Välj filer"), click: function () { pick.click(); } })
      ]),
      el("div", {}, CARDS.map(function (key) { return place(key, texts[key][0], texts[key][1]); })),
      el("div", { class: "rbtns" }, [el("button", { class: "quiet", type: "button", id: "remoteFilesRefresh", text: t("Uppdatera"), click: loadLists })])
    ]));
  }
  /** The files view. With a place (one of the three folders at the top of the screen, window.DAP_FOLDER)
   *  that place's card is brought into view; the row under Dela gives none, and the view starts at its top. */
  function openFiles(place) {
    if (!remote || !core) return;
    if (!filesBox.firstChild) buildFiles();
    var name = (remote.pairing && remote.pairing.name) || t("datorn");
    $("remoteSendText").textContent = t("Filen hamnar i din delningsmapp på {name}. Högst {max} per fil. Ser dina vänner delningsmappen, så ser de också filen.", { name: name, max: kb(core.MAX_FILE) });
    CARDS.forEach(function (key) { say(key, null); }); // what was said about a file removed the last time the view was open
    // Each time the view is opened the share folder is chosen again (or the first place the computer
    // has): a choice of the library made some other time never decides where a file picked now lands.
    core.PUT_PLACES.forEach(function (key) { whereBoxes[key].input.checked = false; });
    offer();
    filesBox.hidden = false;
    filesBox.scrollTop = 0;
    covered();
    shown = typeof place === "string" ? place : null;
    mark(shown);
    bring();
    loadLists();
  }

  // ---- what this page adds to the screen itself: a way to the files, and Forget this computer under Settings ----
  function adorn() {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(NS, "path");
    path.setAttribute("d", "M7 3h7l4 4v14H7zM14 3v4h4M12 10v7M9 14l3 3 3-3");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#39FF14");
    path.setAttribute("stroke-width", "2.2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
    // One more row under Dela (docs/SCREEN.md §6), after the screen's own two.
    var rows = $("shareRows");
    if (rows) rows.appendChild(el("button", { class: "rowBtn", type: "button", id: "goFiles", click: openFiles }, [
      el("span", { class: "ricon" }, [svg]),
      el("span", {}, [el("b", { text: t("Filer på datorn") }), el("span", { class: "small", text: t("Spara till telefonen, eller skicka en fil till datorn.") })])
    ]));
    var note = $("remoteNote");
    if (note) {
      var name = function () { return (remote && remote.pairing && remote.pairing.name) || t("datorn"); };
      var holder = el("div", { class: "srow", id: "remoteForget" }, [el("span", { text: t("Den här telefonen") })]);
      // Made when Settings is opened, so that it names the computer the phone is connected to then.
      var made = null;
      var make = function () { if (made) holder.removeChild(made); made = forgetControl(name()); holder.appendChild(made); };
      make();
      note.appendChild(holder);
      document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-go='settings']"); if (b) make(); });
    }
  }

  // ---- start: the screen's script, then the modules. A browser too old for the modules is told so. ----
  function stopped(title, text, canReload) {
    show([
      el("h2", { text: t(title), id: "remoteStopped" }),
      p(t(text)),
      canReload ? el("div", { class: "rbtns" }, [el("button", { type: "button", text: t("Ladda om"), click: reload })]) : null
    ]);
  }
  var scr = document.createElement("script");
  scr.src = "screen.js";
  var incomplete = false; // the screen's script did not arrive: nothing is started, and nothing takes the message away
  scr.onerror = function () {
    incomplete = true;
    if (remote) remote.stop();
    stopped(N("Sidan kom inte igång"), N("Sidan kom inte hela vägen fram. Kontrollera att telefonen har internet och ladda om sidan."), true);
  };
  scr.onload = function () {
    screen = window.dapShare || null;
    if (!screen) return scr.onerror();
    adorn();
    if (remote && remote.state.phase === "connected") reveal();
  };
  document.body.appendChild(scr);

  var loading;
  try { loading = import("./web/remote-core.js"); } catch (e) { loading = Promise.reject(e); }
  loading.then(function (m) {
    if (incomplete) return;
    // Never inside another site's page. (A policy in a meta tag cannot say this, and GitHub
    // Pages sends no header of ours, so the page looks for itself, before it reads its key.)
    var framed = true;
    try { framed = window.top !== window.self; } catch (e) { framed = true; }
    if (framed) return stopped(N("Sidan kom inte igång"), N("Sidan visas inuti en annan sida, och där används den inte: ett tryck där vore ditt eget tryck på en skärm du inte ser. Öppna dapshare.app/remote direkt."), false);
    if (!window.isSecureContext) return stopped(N("Sidan kom inte igång"), N("Sidan måste öppnas med https. Öppna dapshare.app/remote."), false);
    if (!window.indexedDB || !window.crypto || !window.crypto.subtle || typeof WebSocket !== "function") return stopped(N("Det här behöver en nyare telefon"), N("Sidan använder kryptering som den här telefonens webbläsare inte klarar. Uppdatera telefonens system och försök igen."), false);
    core = m;
    remote = core.createRemote({ storage: storage, name: function () { return phoneName; }, onState: onState });
    window.dapRemote = remote; // for looking at from the console, and for the tests
    remote.setActive(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", function () {
      var front = document.visibilityState !== "hidden";
      remote.setActive(front);
      if (front) remote.probe(); // a line that died while the phone slept is found out now
    });
    // The network came back, or changed (Wi-Fi to mobile data): try now, and find out whether the line that was up still is.
    window.addEventListener("online", function () { remote.retryNow(); remote.probe(); });
    remote.start();
  }, function (e) {
    // A script the browser cannot read (new syntax) or run (something missing) is a phone that is
    // too old; anything else is more likely a page that did not arrive whole.
    var old = e && (e.name === "SyntaxError" || e.name === "ReferenceError");
    if (old) stopped(N("Det här behöver en nyare telefon"), N("Sidan använder kryptering som den här telefonens webbläsare inte klarar. Uppdatera telefonens system och försök igen."), false);
    else stopped(N("Sidan kom inte igång"), N("Kontrollera att telefonen har internet och ladda om sidan. Hjälper inte det behöver sidan en nyare telefon: uppdatera telefonens system."), true);
  });
})();
