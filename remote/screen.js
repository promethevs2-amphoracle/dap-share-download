/* DAP-Share, the page at /remote/. Copyright (c) 2026 Spiridon Iconomou. All rights reserved. */
  const $ = (id) => document.getElementById(id);
  // Written for old browsers too (Chrome 67 on OS X 10.9, ES2019 at most): no ?., no ??, no Object.fromEntries; `or` is the ?? here.
  const or = (a, b) => (a === undefined || a === null ? b : a);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // ---- language: Swedish or English. ?lang=sv|en wins and is remembered; otherwise the browser's language. ----
  const LANG = (function () {
    let l = null;
    try {
      const m = /[?&]lang=(sv|en)\b/.exec(location.search);
      if (m) { l = m[1]; localStorage.setItem("dap_lang", l); } else l = localStorage.getItem("dap_lang");
    } catch (e) { l = null; }
    if (l !== "sv" && l !== "en") l = /^sv\b/i.test(navigator.language || "") ? "sv" : "en";
    return l;
  })();
  const LOCALE = LANG === "en" ? "en-GB" : "sv-SE";
  // The Swedish text is the key; English is looked up. A missing entry shows the Swedish.
  const EN = {
      "Min agent": "My agent",
      "Inställningar": "Settings",
      "Tillbaka": "Back",
      "Vad vill du göra?": "What do you want to do?",
      "Filer går från din agent till deras, krypterat. Inget öppnas utan ditt ja.": "Files go from your agent to theirs, encrypted. Nothing opens without your yes.",
      "Skicka filer": "Send files",
      "Välj filer, få en kod, säg till den andra.": "Pick files, get a code, tell the other person.",
      "Ta emot filer": "Receive files",
      "Klistra in adressen och koden du fått.": "Paste the address and code you were sent.",
      "Mötas på plats": "Meet in person",
      "Visa din QR-kod eller skanna den andras.": "Show your QR code or scan theirs.",
      "Välj filer": "Choose files",
      "Säg till": "Tell them",
      "Välj vad du vill skicka": "Choose what to send",
      "Lägg filer i din DAP-Share-mapp och bocka för dem här.": "Put files in your DAP-Share folder, then tick them here.",
      "Din DAP-Share-mapp": "Your DAP-Share folder",
      "Nästa": "Next",
      "Koden som den andra personen behöver. Du kan byta den.": "The code the other person needs. You can change it.",
      "Ny kod": "New code",
      "Ingen kod syntes på bilden. Försök igen, närmare och rakt framifrån.": "No code could be seen in the picture. Try again, closer and straight on.",
      "Bilden gick inte att läsa": "The picture could not be read",
      "Slå på": "Turn on",
      "Stäng av": "Turn off",
      "dela själv till vänner, inom gränser": "share with friends by itself, within limits",
      "dela själv till vänner, utan gränser": "share with friends by itself, without limits",
      "Får läsa filerna i ditt bibliotek": "May read the files in your library",
      "Det du gillar": "What you like",
      "Visas för dina vänner, så att deras AI-agent vet vad du gillar. Med egna ord: ämnen, platser, musik, projekt.": "Shown to your friends, so their AI agent knows what you like. In your own words: topics, places, music, projects.",
      "t.ex. design, Lissabon, jazz, AI-agenter": "e.g. design, Lisbon, jazz, AI agents",
      "Spara": "Save",
      "Gillar: ": "Likes: ",
      "nivå 3: delar själv med vänner, utan gränser": "level 3: shares with friends by itself, without limits",
      "Lägg här det du gärna ger bort. Din AI-agent väljer härifrån åt dina vänner: {p}": "Put here what you would happily give away. Your AI agent picks from here for your friends: {p}",
      "Ditt bibliotek": "Your library",
      "Sparat. Dina vänner får det vid nästa möte.": "Saved. Your friends get it at your next meeting.",
      "Kopiera för Claude Desktop": "Copy for Claude Desktop",
      "Kopiera för Codex": "Copy for Codex",
      "Klistra in i Claude Desktop: Settings → Developer → Edit Config. Spara och starta om Claude.": "Paste it in Claude Desktop: Settings → Developer → Edit Config. Save and restart Claude.",
      "Klistra in i": "Paste it in",
      "och starta om Codex. ChatGPT:s chatt når inte program på din dator.": "and restart Codex. ChatGPT's chat cannot reach programs on your computer.",
      "Visa raderna": "Show the lines",
      "Vänner": "Friends",
      "En väns säkra filer kommer in utan knapp. Lägg till en vän genom att bocka för vänförfrågan när ni möts.": "A friend's safe files come in without the button. Add a friend by ticking the friend request when you meet.",
      "Den här datorn": "This computer",
      "Synlig på nätverket": "Visible on the network",
      "Språk": "Language",
      "Håll den här Macen vaken medan DAP-Share är igång": "Keep this Mac awake while DAP-Share runs",
      "Då når telefonen den dygnet runt, när den sitter i laddaren med locket öppet. En bärbar Mac med stängt lock sover ändå, och utan laddare tar batteriet slut.": "Then your phone reaches it day and night, when it is on its charger with the lid open. A laptop with its lid closed sleeps anyway, and without the charger the battery runs out.",
      "Starta DAP-Share när jag loggar in": "Start DAP-Share when I log in",
      "Gäller från nästa gång du loggar in. Den startar tyst, utan att öppna skärmen. Den pekar på där appen ligger nu: flyttar du appen, stäng av och slå på igen.": "From the next time you log in. It starts quietly, without opening the screen. It points at where the app is now: if you move the app, turn this off and on again.",
      "Den pekar på en plats där appen inte ligger nu, så DAP-Share startar inte vid inloggning. Stäng av och slå på igen.": "It points at a place where the app is not now, so DAP-Share does not start at login. Turn it off and on again.",
      "Går inte att slå på härifrån: macOS kör appen från en tillfällig plats. Dra DAP-Share till Program i Finder och öppna den därifrån.": "Cannot be turned on from here: macOS is running the app from a temporary place. Drag DAP-Share to Applications in Finder and open it from there.",
      "på": "on",
      "Allt som kommit in, med granskningens rapport.": "Everything that came in, with the check's report.",
      "Skicka också en vänförfrågan": "Also send a friend request",
      "Din mapp för mottaget": "Your Received folder",
      "Det du släpper in hamnar här.": "What you let in lands here.",
      "Visa en ny kod": "Show a new code",
      "Byt filer": "Change the files",
      "Säg till den andra personen": "Tell the other person",
      "De behöver din adress och koden. Ett tryck skriver meddelandet åt dig.": "They need your address and the code. One tap writes the message for you.",
      "Dela fler filer": "Share more files",
      "Klistra in det den andra personen skickade.": "Paste what the other person sent you.",
      "Deras adress": "Their address",
      "Koden": "The code",
      "Fler sätt att nå den andra": "More ways to reach them",
      "Framme, förseglat tills du säger ja": "Arrived, sealed until you say yes",
      "Skanna den andras kod": "Scan the other person's code",
      "Koden som text": "The code as text",
      "I närheten": "Nearby",
      "online": "online",
      "ansluter …": "connecting …",
      "bara det här nätverket": "this network only",
      "{n} fil väntar på ditt ja. Visa": "{n} file is waiting for your yes. Show",
      "{n} filer väntar på ditt ja. Visa": "{n} files are waiting for your yes. Show",
      "{n} fil: {names}": "{n} file: {names}",
      "{n} filer: {names}": "{n} files: {names}",
      "Din adress:": "Your address:",
      "Kopiera": "Copy",
      "relä: av": "relay: off",
      "Möten": "Meetings",
      "hämtar läget …": "fetching the state …",
      "Visa min kod": "Show my code",
      "Den andra personen skannar koden i rummet. Den gäller en gång, i fem minuter, och bevisar att ni verkligen träffades.": "The other person scans the code in the room. It works once, for five minutes, and proves that you really met.",
      "Visa kod": "Show code",
      "Möt någon": "Meet someone",
      "Över internet": "Over the internet",
      "På samma nätverk": "On the same network",
      "söker …": "searching …",
      "I samma rum": "In the same room",
      "Skanna kod": "Scan code",
      "skicka vänförfrågan": "send a friend request",
      "Möt": "Meet",
      "Dela": "Share",
      "Vem får dem": "Who gets them",
      "Hur länge, i timmar": "For how long, in hours",
      "den jag träffar fysiskt (skannar min kod)": "people I meet in person (they scan my code)",
      "mina vänner": "my friends",
      "namngivna adresser": "named addresses",
      "den som har en kod": "anyone with the code",
      "Dela de förbockade": "Share the ticked ones",
      "Delas just nu": "Shared right now",
      "inget": "nothing",
      "Den som ska hämta behöver din adress (överst på sidan) och, om du valde en kod, koden.": "Whoever fetches needs your address (at the top of the page) and, if you chose a code, the code.",
      "Din AI-agent": "Your AI agent",
      "Vad den får göra": "What it may do",
      "ingenting, avstängd": "nothing, switched off",
      "titta: ser mappen och läget": "look: sees the folder and what is going on",
      "föreslå: du säger ja eller nej (rekommenderas)": "propose: you say yes or no (recommended)",
      "dela inom dina regler": "share inside your rules",
      "Avstängd. Ingen AI-agent kommer åt DAP-Share.": "Switched off. No AI agent can reach DAP-Share.",
      "Din AI-agent föreslår att du delar": "Your AI agent proposes that you share",
      "Kopiera för Claude Desktop": "Copy for Claude Desktop",
      "Kopiera för Codex": "Copy for Codex",
      "Kopierat. Klistra in i Claude Desktop.": "Copied. Paste it into Claude Desktop.",
      "Kopierat. Klistra in i ~/.codex/config.toml.": "Copied. Paste it into ~/.codex/config.toml.",
      "Markera raderna och kopiera dem själv": "Select the lines and copy them yourself",
      "AI-agenten är avstängd": "The AI agent is switched off",
      "Sparat": "Saved",
      "Skicka det till den andra personen:": "Send it to the other person:",
      "E-post": "Email",
      "Meddelanden": "Messages",
      "Kopiera meddelandet": "Copy the message",
      "Från min agent till din: filer väntar på dig.": "From my agent to yours: files are waiting.",
      "Hämta appen från länken och dra den till Program.": "Get the app from the link and drag it to Applications.",
      "Första gången: högerklicka på appen och välj Öppna.": "The first time: right-click the app and choose Open.",
      "Klistra in min adress under Ta emot: {addr}": "Paste my address under Receive: {addr}",
      "Koden: {code}": "The code: {code}",
      "Koden får du av mig separat.": "I'll give you the code separately.",
      "Tryck Hämta.": "Press Fetch.",
      "Filer till dig via DAP-Share": "Files for you on DAP-Share",
      "Meddelandet är kopierat": "The message is copied",
      "Markera och kopiera själv": "Select it and copy it yourself",
      "öppna Settings → Developer → Edit Config. Klistra in raderna, spara och starta om Claude. Lägg bara till delen": "open Settings → Developer → Edit Config. Paste the lines, save, and restart Claude. Add only the part",
      "om filen redan har": "if the file already has",
      "ChatGPT-appens chatt når bara servrar på internet, inte program på din dator. I Codex, OpenAIs app för kod, fungerar det: klistra in raderna i": "ChatGPT's chat reaches only servers on the internet, not programs on your computer. In Codex, OpenAI's app for code, it works: paste the lines into",
      "Inkorg": "Inbox",
      "Fil": "File",
      "Från": "From",
      "Vad": "What",
      "Rapport": "Report",
      "Status": "Status",
      "Vänner och förfrågningar": "Friends and requests",
      "Journal": "Journal",
      "Vem, när, typ och storlek. Aldrig innehåll.": "Who, when, kind and size. Never content.",
      "Rikta kameran mot den andres kod": "Point the camera at the other person's code",
      "Avbryt": "Cancel",
      "den andras adress, dap:crypto:…": "the other person's address, dap:crypto:…",
      "relä, värd:port": "relay, host:port",
      "eller datorns adress (t.ex. 192.168.1.20)": "or the computer's address (e.g. 192.168.1.20)",
      "port": "port",
      "…eller klistra in koden som text": "…or paste the code as text",
      "kod (om ni kommit överens om en)": "code (if you agreed on one)",
      "sammanhang (valfritt)": "context (optional)",
      "koden ni kommit överens om (minst 6 tecken)": "the code you agreed on (at least 6 characters)",
      "adresser, dap:crypto:… med komma emellan": "addresses, dap:crypto:… separated by commas",
      "sammanhang (valfritt, t.ex. nordic-ai-summit-2026)": "context (optional, e.g. nordic-ai-summit-2026)",
      "på det här nätverket: {a}": "on this network: {a}",
      "relä: ansluten": "relay: connected",
      "relä: inte ansluten": "relay: not connected",
      "inget relä: möten över internet går inte": "no relay: meetings over the internet are not possible",
      "syns på nätverket": "visible on the network",
      "syns inte på nätverket": "not visible on the network",
      "mDNS: andra agenter på samma nätverk ser den här": "mDNS: other agents on the same network see this one",
      "mDNS: andra agenter på samma nätverk ser inte den här": "mDNS: other agents on the same network do not see this one",
      "vän": "friend",
      "främling": "stranger",
      "Släpp in de gröna ({n})": "Let the green ones in ({n})",
      "Inga möten än. Dela en fil eller möt någon, så syns det här.": "No meetings yet. Share a file or meet someone, and it shows here.",
      "{n} fil från {who}": "{n} file from {who}",
      "{n} filer från {who}": "{n} files from {who}",
      "alla gröna": "all green",
      "alla röda": "all red",
      "{g} gröna, {r} röd": "{g} green, {r} red",
      "{g} gröna, {r} röda": "{g} green, {r} red",
      "väntar på ditt tryck": "waiting for your press",
      "det röda väntar i inkorgen": "the red ones wait in the inbox",
      "det gula väntar i inkorgen": "the yellow ones wait in the inbox",
      "det röda och gula väntar i inkorgen": "the red and yellow ones wait in the inbox",
      "i hubben": "in the hub",
      "väntar": "waiting",
      "i hubben ({f})": "in the hub ({f})",
      "Släpp in": "Let in",
      "Kasta": "Discard",
      "Tomt.": "Empty.",
      "Vänförfrågan från": "Friend request from",
      "Acceptera": "Accept",
      "Avböj": "Decline",
      "vän, utan knapp": "friend, without the button",
      "vän, med knapp": "friend, with the button",
      "Gör till främling": "Make a stranger",
      "Ta bort": "Remove",
      "Inga kontakter.": "No contacts.",
      "Träffade: ": "Met: ",
      "gör till vän": "make a friend",
      "den jag träffar fysiskt": "people I meet in person",
      "vänner": "friends",
      "namngivna": "named",
      "den som har koden": "anyone with the code",
      "till {who}": "to {who}",
      "{n} identiteter": "{n} identities",
      "till {when}": "until {when}",
      "delat av rådgivaren": "shared by the advisor",
      "Sluta dela": "Stop sharing",
      "nivå 0, titta: ser mappen och läget, inget mer": "level 0, look: sees the folder and the state, nothing more",
      "nivå 1, föreslå: lägger förslag här, du säger ja eller nej": "level 1, propose: puts proposals here, you say yes or no",
      "nivå 2, inom regler: delar själv, men bara inom dina regler": "level 2, within rules: shares by itself, but only within your rules",
      "En modell kan tala med agenten ({level}). Den når aldrig knappen, slussen, vännerna eller innehållet.": "A model can talk to the agent ({level}). It never reaches the button, the airlock, the friends or the content.",
      " Regler: {aud}, högst {h} h, högst {f} filer åt gången": " Rules: {aud}, at most {h} h, at most {f} files at a time",
      ", bara {x}": ", only {x}",
      "du sa ja": "you said yes",
      "du sa nej": "you said no",
      "togs tillbaka": "was withdrawn",
      "till {who} i {h} h": "to {who} for {h} h",
      "kod (minst 6 tecken) – du väljer den, inte rådgivaren": "code (at least 6 characters) – you choose it, not the advisor",
      "Inga förslag just nu.": "No proposals right now.",
      "dokument": "document",
      "bild": "picture",
      "video": "video",
      "ljud": "audio",
      "arkiv": "archive",
      "kontaktkort": "contact card",
      "länk": "link",
      "Lägg filer i mappen {folder}. Bocka för dem här och välj vem som får dem. Det som någon redan tagit emot och släppt in kan inte tas tillbaka.": "Put files in the folder {folder}. Tick them here and choose who gets them. What someone has already received and let in cannot be taken back.",
      "delas inte: ": "not shared: ",
      "Mappen är tom.": "The folder is empty.",
      "Bocka för minst en fil": "Tick at least one file",
      "Gick inte att dela: ": "Could not share: ",
      "Delar {n} fil": "Sharing {n} file",
      "Delar {n} filer": "Sharing {n} files",
      ", hoppade över {n}": ", skipped {n}",
      "{a} släpptes in, {b} väntar": "{a} let in, {b} waiting",
      "Insläppt i hubben": "Let into the hub",
      "Kastad": "Discarded",
      "Vän tillagd": "Friend added",
      "Vänner ser din delningsmapp": "Friends see your share folder",
      "Hitta folk och se vad dina vänner delar.": "Find people and see what your friends share.",
      "Hitta folk": "Find people",
      "Dina vänner": "Your friends",
      "En väns säkra filer kommer in utan knapp. Ni blir vänner när båda har sagt ja.": "A friend's safe files come in without the button. You become friends when both have said yes.",
      "Andra kan hitta dig": "Others can find you",
      "sök på namn, eller klistra in en adress (dap:crypto:…)": "search by name, or paste an address (dap:crypto:…)",
      "Sök": "Search",
      "Ska andra kunna hitta dig?": "Let others find you?",
      "Vad som visas och sparas": "What is shown and kept",
      "Blockera": "Block",
      "blockerad": "blocked",
      "Blockerad": "Blocked",
      "Häv blockering": "Unblock",
      "Blockeringen är hävd": "Unblocked",
      "Blockera {name}? De får inget från dig, och deras förfrågningar visas inte. De får inte veta det.": "Block {name}? They get nothing from you, and their requests are not shown. They are not told.",
      "Blockerade. De får inget från dig och deras förfrågningar visas inte. De får inte veta att de är blockerade.": "Blocked. They get nothing from you and their requests are not shown. They are not told they are blocked.",
      "1 vänförfrågan till hölls tillbaka den senaste timmen (högst 10 nya i timmen).": "1 more friend request was held back in the last hour (at most 10 new an hour).",
      "{n} vänförfrågningar till hölls tillbaka den senaste timmen (högst 10 nya i timmen).": "{n} more friend requests were held back in the last hour (at most 10 new an hour).",
      "Den som har appen kan se ditt namn och skicka en vänförfrågan. Bara vänner du accepterar ser dina filer. Du kan ändra dig under Vänner.": "People with the app can see your name and send you a friend request. Only friends you accept can see your files. You can change this under Friends.",
      "Ja, gör mig synlig": "Yes, make me visible",
      "Nej": "No",
      "Sök bland dem som valt att synas. Skicka en vänförfrågan; när den andra säger ja ser ni varandras delningsmappar.": "Search among the people who chose to be visible. Send a friend request; when the other person says yes, you see each other's share folders.",
      "Katalogen finns inte på det här reläet än. Du kan fortfarande lägga till en vän med en kod eller när ni möts.": "This relay does not have the directory yet. You can still add a friend with a code or when you meet.",
      "ja, som {name}": "yes, as {name}",
      "ja, ansluter …": "yes, connecting …",
      "nej": "no",
      "Sluta synas": "Stop being visible",
      "Bli synlig": "Become visible",
      "frågad, väntar på svar": "asked, waiting for an answer",
      "Bli vänner": "Add friend",
      "Visar {a} av {b}. Sök på ett namn för att hitta fler.": "Showing {a} of {b}. Search for a name to find more.",
      "Ingen hittades.": "Nobody found.",
      "Väntar på svar från: ": "Waiting for an answer from: ",
      "Nu kan andra hitta dig": "Others can now find you",
      "Du syns inte i katalogen": "You are not in the directory",
      "skickar vänförfrågan …": "sending friend request …",
      "Ni är vänner nu": "You are friends now",
      "Förfrågan skickas när de är online": "The request is sent when they are online",
      "Vänförfrågan skickad": "Friend request sent",
      "Ska dina vänner se din delningsmapp?": "Should your friends see your share folder?",
      "Då kan vänner du har accepterat hämta det som ligger i mappen, utan att du delar fil för fil. Ingen annan ser den. Du kan ändra dig under Vänner.": "If you say yes, the friends you have accepted can fetch whatever is in the folder, and you no longer share file by file. Nobody else sees it. You can change this under Friends.",
      "Ja, visa den för mina vänner": "Yes, show it to my friends",
      "Nej, jag väljer själv varje gång": "No, I choose each time",
      "på: {n} fil": "on: {n} file",
      "på: {n} filer": "on: {n} files",
      "av": "off",
      "Visa mappen": "See folder",
      "du har den": "you have it",
      "Hämta alla": "Fetch all",
      "Stäng": "Close",
      "Hos {name}": "At {name}'s",
      "Utvalt åt dig": "Picked for you",
      "Delat med dig": "Shared with you",
      "I mappen": "In the folder",
      "Inget just nu.": "Nothing right now.",
      "Som det var {date}": "As it was on {date}",
      " och {n} till när {name}s dator är på": " and {n} more when {name}'s computer is on",
      "Väntar på att nå {name}": "Waiting to reach {name}",
      "Kom inte fram innan det tog slut": "Did not arrive before it ended",
      "Dina vänner ser nu din delningsmapp": "Your friends now see your share folder",
      "Dina vänner ser inte mappen": "Your friends do not see the folder",
      "tittar i mappen …": "looking in the folder …",
      "hämtar …": "fetching …",
      "Hämtade {n} fil": "Fetched {n} file",
      "Hämtade {n} filer": "Fetched {n} files",
      ", {n} gick inte": ", {n} did not work",
      ", {n} hade du redan": ", {n} you had already",
      "Delas inte längre": "No longer shared",
      "Den delningen fanns inte kvar": "That share was already gone",
      "En äldre plats öppnas fortfarande när du loggar in. Stäng av här. Slå sedan på igen från appen där den ligger nu, om du vill.": "An older place is still opened when you log in. Turn it off here. Then turn it on again from the app where it is now, if you like.",
      " som rådgivaren föreslog": " as the advisor proposed",
      "Gick inte: ": "Did not work: ",
      "Avböjt": "Declined",
      "Adressen är kopierad": "The address is copied",
      "Markera adressen och kopiera den själv": "Select the address and copy it yourself",
      "Gäller en gång, till {t}. Visa den för personen framför dig.": "Works once, until {t}. Show it to the person in front of you.",
      " Koden bär reläadressen: det går även om ni är på olika nät.": " The code carries the relay address: it works even if you are on different networks.",
      "Ingen kamera i den här webbläsaren – klistra in koden som text": "No camera in this browser – paste the code as text",
      "Kameran kräver HTTPS – öppna appen via en säker adress, eller klistra in koden som text": "The camera needs HTTPS – open the app at a secure address, or paste the code as text",
      "Kameran gick inte att öppna: ": "The camera could not be opened: ",
      "Det var ingen DAP-kod": "That was not a DAP code",
      "Kod skannad: möter {id} …": "Code scanned: meeting {id} …",
      "möter {id} …": "meeting {id} …",
      "möter …": "meeting …",
      "Mötet misslyckades: ": "The meeting failed: ",
      "Möte med {name}": "Meeting with {name}",
      " (via relä)": " (through the relay)",
      ": tog emot {a}, erbjöd {b}": ": received {a}, offered {b}",
      ", vänförfrågan {s}": ", friend request {s}",
      "Koden gick inte att läsa": "The code could not be read",
      "Ange den andras dap:crypto:… bredvid reläet": "Enter the other person's dap:crypto:… next to the relay",
      "Fyll i den andras adress, en dator på nätverket eller en skannad kod": "Fill in the other person's address, a computer on the network or a scanned code",
      "Ingen annan agent syns på det här nätverket just nu.": "No other agent is visible on this network right now.",
      "kunde inte söka": "could not search",
      "Öppna mappen": "Open the folder",
      "Skicka": "Send",
      "Ta emot": "Receive",
      "Hämta": "Fetch",
      "Fler val": "More choices",
      "Mer": "More",
      "Möt på andra sätt": "Other ways to meet",
      "Nätverk": "Network",
      "Här visas det du tar emot.": "What you receive shows up here.",
      "Filer i {folder}": "Files in {folder}",
      "Lägg filer i delningsmappen.": "Put files in the share folder.",
      "Stäng av DAP-Share": "Stop DAP-Share",
      "Stäng av DAP-Share? Ingen kan nå dig förrän du öppnar appen igen.": "Stop DAP-Share? Nobody can reach you until you open the app again.",
      "DAP-Share är avstängd": "DAP-Share is stopped",
      "Öppna appen igen när du vill dela eller ta emot. Det du redan släppt in ligger kvar i din mapp.": "Open the app again when you want to share or receive. What you already let in stays in your folder.",
      "Mappen gick inte att öppna": "The folder could not be opened",
      "Din telefon, var du än är": "Your phone, from anywhere",
      "Telefonen når agenten på den här datorn över internet, krypterat hela vägen. Den får göra det du gör här, utom att ändra inställningarna. Högst tre telefoner.": "Your phone reaches the agent on this computer over the internet, encrypted all the way. It may do what you do here, except change the settings. At most three phones.",
      "Anslut en telefon": "Connect a phone",
      "Öppna dapshare.app/remote på telefonen och lägg sidan på hemskärmen: Dela → Lägg till på hemskärmen.": "Open dapshare.app/remote on your phone and add the page to your home screen: Share → Add to Home Screen.",
      "Öppna den från hemskärmen och tryck på Skanna koden på min dator.": "Open it from the home screen and press Scan the code on my computer.",
      "Jämför de fyra siffrorna på telefonen med dem som visas här, och svara sedan här.": "Compare the four digits on the phone with the ones shown here, then answer here.",
      "Koden gäller en gång, i fem minuter: till {t}.": "The code works once, for five minutes: until {t}.",
      "Ingen telefon är ansluten än.": "No phone is connected yet.",
      "ansluten nu": "connected now",
      "inte ansluten nu": "not connected now",
      "Tillagd {a} · senast använd {b}": "Added {a} · last used {b}",
      "Ta bort {name}? Den kommer inte in igen förrän du ansluter den på nytt.": "Remove {name}? It cannot get in again until you connect it anew.",
      "Ja, ta bort": "Yes, remove",
      "Alla {max} platserna är tagna. Ta bort en telefon för att ansluta en ny.": "All {max} places are taken. Remove a phone to connect a new one.",
      "Just nu kan ingen kod göras: telefonen når datorn genom agentens relä, och det saknas eller har inget namn.": "No code can be made right now: the phone reaches the computer through the agent's relay, and there is none, or it has no name.",
      "En telefon vill bli din fjärrkontroll": "A phone wants to be your remote",
      "Den kallar sig {name}": "It calls itself {name}",
      "Tryck ja bara om din egen telefon just nu visar samma fyra siffror. Visar den något annat, eller ingenting: tryck nej. En fjärrkontroll får göra allt du gör här, utom att ändra inställningarna.": "Press yes only if your own phone is showing the same four digits right now. If it shows anything else, or nothing: press no. A remote may do everything you do here, except change the settings.",
      "Ja, tillåt": "Yes, allow",
      "Telefonen är ansluten": "The phone is connected",
      "Telefonen släpptes inte in": "The phone was not let in",
      "Den frågan gäller inte längre": "That question no longer stands",
      "Telefonen är borttagen": "The phone is removed",
      "Telefonen var redan borttagen": "The phone was already removed",
      "Koden är tillbakatagen": "The code is taken back",
      "Fjärrkontroll": "Remote",
      "Fjärrkontroll: din telefon når {name}, krypterat hela vägen.": "Remote: your phone is reaching {name}, encrypted all the way.",
      "Det här är din telefon som fjärrkontroll för {name}. Inställningarna ändrar du på datorn: AI-agenten, det du gillar, vem som hittar dig, vad dina vänner ser, telefonerna och att stänga av.": "This is your phone as a remote for {name}. You change the settings on the computer: the AI agent, what you like, who can find you, what your friends see, the phones, and stopping the app.",
      "Det här ändrar du på datorn.": "You change this on the computer.",
      "Visa som kod": "Show as a code",
      "Version": "Version",
      "Två saker att bestämma": "Two things to decide",
      "Vänner, Dela och Inställningar finns i raden längst ner.": "Friends, Share and Settings are in the row at the bottom.",
      "Vänner, Dela och Inställningar finns i raden till vänster.": "Friends, Share and Settings are in the row at the left.",
      "Gick inte att kasta: filen var inte längre förseglad": "Could not discard: the file was no longer sealed",
      "Väntar på ditt ja": "Waiting for your yes",
      "Inget väntar.": "Nothing is waiting.",
      "I närheten · samma wi-fi": "Nearby · same Wi-Fi",
      "I närheten · samma wi-fi som datorn": "Nearby · the same Wi-Fi as the computer",
      "Träffade": "Met",
      "Träffade ({n})": "Met ({n})",
      "Blockerade": "Blocked",
      "Blockerade ({n})": "Blocked ({n})",
      "Lägg till vän": "Add a friend",
      "Skanna deras kod": "Scan their code",
      "Skriv in en adress": "Enter an address",
      "Den andras adress, dap:crypto:…, som de skickat dig. Förfrågan går genom reläet.": "The other person's address, dap:crypto:…, as they sent it to you. The request goes through the relay.",
      "Koden är datorns adress. Den andra skannar den, och mötet går genom reläet.": "The code is the computer's address. The other person scans it, and the meeting goes through the relay.",
      "Skriv den andras adress, dap:crypto:…": "Enter the other person's address, dap:crypto:…",
      "Dela filer": "Share files",
      "Hämta med en kod": "Fetch with a code",
      "Ute nu": "Out now",
      "Vänner ser din delningsmapp som den är. Lägg filer där, så behövs inget tryck.": "Friends see your share folder as it is. Put files there, and no press is needed.",
      "Det som kommer in väntar förseglat under Hem tills du säger ja.": "What comes in waits sealed under Home until you say yes.",
      "Det du gillar · Biblioteket": "What you like · The library",
      "Vänner får": "Friends get",
      "Koppla Claude eller Codex": "Connect Claude or Codex",
      "Raderna som låter en modell tala med agenten på den här datorn. Den når aldrig knappen, slussen, vännerna eller innehållet.": "The lines that let a model talk to the agent on this computer. It never reaches the button, the airlock, the friends or the content.",
      "Inkorg och journal": "Inbox and journal",
      "Språk · Om · Integritet": "Language · About · Privacy",
      "Senast avgjorda förslag": "The last proposals decided",
      "Vem som hittar dig, vad dina vänner ser, och vems gröna filer som går rakt in.": "Who can find you, what your friends see, and whose green files go straight in.",
      "Vänner du accepterat hämtar det som ligger i mappen, utan att du delar fil för fil.": "Friends you have accepted fetch what is in the folder, without you sharing file by file.",
      "Gröna filer som går rakt in": "Green files that go straight in",
      "Bara filer granskningen fann rena, aldrig program. Gula och röda väntar alltid på ditt tryck.": "Only files the review found clean, never programs. Yellow and red always wait for your press.",
      "Vem, när, typ och storlek, med granskningens rapport. Aldrig innehåll.": "Who, when, kind and size, with the review's report. Never content.",
      "Alla": "All",
      "Mottaget": "Received",
      "Skickat": "Sent",
      "Rakt in": "Straight in",
      "När": "When",
      "Vem": "Who",
      "Integritet": "Privacy",
      "DAP-Share © 2026 Spiridon Iconomou. Alla rättigheter förbehållna. Protokollet är fritt (Apache-2.0).": "DAP-Share © 2026 Spiridon Iconomou. All rights reserved. The protocol is free (Apache-2.0).",
      "Hem": "Home",
      "Agent på": "Agent on",
      "Agent av": "Agent off",
      "Molnet på": "Cloud on",
      "Molnet görs": "Cloud being made",
      "görs": "being made",
      "Molnet görs.": "The cloud is being made.",
      "Molnet kunde inte göras än; försöker igen.": "The cloud could not be made yet; trying again.",
      // A make refused for want of an invitation (docs/CLOUD.md §9.2, §9.6).
      "Molnet väntar på en inbjudan": "Cloud waits for an invitation",
      "väntar på inbjudan": "waiting for an invitation",
      "Molnet väntar på plats": "Cloud waits for room",
      "väntar på plats": "waiting for room",
      "Molnet behöver en inbjudan: en vän som redan har molnet. Datorn frågar igen av sig själv.": "The cloud needs an invitation: a friend who already has it. The computer asks again by itself.",
      "Du är inbjuden, men molnet tar inte in fler just nu. Datorn frågar igen av sig själv.": "You are invited, but the cloud takes no more for now. The computer asks again by itself.",
      "Molnet {p} %": "Cloud {p} %",
      "Molnet behöver dig": "Cloud needs you",
      // The cloud's row and page (docs/CLOUD.md §9.6), word for word.
      "Molnet": "Cloud",
      "Dina vänner kan hämta det du delar även när datorn är av. Allt ligger förseglat; servern kan inte läsa något.": "Your friends can fetch what you share even when this computer is off. Everything is sealed; the server cannot read any of it.",
      "skickar {p} %": "sending {p} %",
      "{n} ändring på väg": "{n} change on its way",
      "{n} ändringar på väg": "{n} changes on their way",
      "fullt": "full",
      "behöver dig": "needs you",
      "inget moln här": "no cloud here",
      "Det här skickas: {size}. Hur lång tid det tar visas när det har börjat.": "To be sent: {size}. How long it takes shows once it has started.",
      "Skickar {p} % · cirka {m} min kvar": "Sending {p} % · about {m} min left",
      "{size} finns bara på datorn": "{size} is only on this computer",
      "Vänner ser din mapp till {date}": "Friends see your folder until {date}",
      "1 vän har en äldre DAP-Share och ser inget när datorn är av": "1 friend has an older DAP-Share and sees nothing while this computer is off",
      "{n} vänner har en äldre DAP-Share och ser inget när datorn är av": "{n} friends have an older DAP-Share and see nothing while this computer is off",
      "1 ändring på väg till molnet": "1 change on its way to the cloud",
      "{n} ändringar på väg till molnet": "{n} changes on their way to the cloud",
      "Molnet är fullt. Det som inte får plats finns bara på datorn.": "The cloud is full. What does not fit is only on this computer.",
      "Datorns klocka skiljer sig från molnets med {m} min. Inget stoppas; kontrollera tiden i Systeminställningar.": "This computer's clock differs from the cloud's by {m} min. Nothing is stopped; check the time in System Settings.",
      "Datorns klocka gick fel; vännerna tar emot igen {date}.": "This computer's clock was wrong; friends accept again on {date}.",
      "DAP-Share används nu på en annan dator med samma nyckel.": "DAP-Share is now used on another computer with the same key.",
      "Använd den här igen": "Use this one again",
      "Telefonen är borttagen här och i molnet. {a} av {b} vänner vet det; de andra litar på den till {date}.": "The phone is removed here and in the cloud. {a} of {b} friends know; the others trust it until {date}.",
      "Försegla allt igen (cirka {m} min)": "Seal everything again (about {m} min)",
      "1 ändring från en borttagen telefon": "1 change from a removed phone",
      "{n} ändringar från en borttagen telefon": "{n} changes from a removed phone",
      "Behåll": "Keep",
      "Borttaget i molnet de senaste 7 dagarna: {n}": "Removed in the cloud in the last 7 days: {n}",
      "Det äldsta borttagna raderades tidigare, för att platsen tog slut.": "The oldest removed items were deleted early, because the room ran out.",
      "Molnet hade raderats efter 180 dagar utan kontakt. Ett nytt är gjort och allt skickas igen.": "The cloud was deleted after 180 days without contact. A new one is made and everything is sent again.",
      "Den här reläservern har inget moln.": "This relay has no cloud.",
      "Stäng av molnet": "Turn off the cloud",
      "Det som ligger i molnet raderas. Slår du på igen skickas allt på nytt.": "What is in the cloud is deleted. If you switch on again, everything is sent again.",
      "Görs i molnet när datorn når det": "Done in the cloud when the computer reaches it",
      "Offline": "Offline",
      "Offline · {h} h": "Offline · {h} h",
      "{n} väntar": "{n} waiting",
      "Inget väntar": "Nothing waiting",
      "Krypterat hela vägen via {host}": "Encrypted all the way via {host}",
      "Inget relä": "No relay",
      "Förseglat tills du säger ja.": "Sealed until you say yes.",
      "Du väljer dina vänner. Din agent väljer ur ditt bibliotek åt var och en. Det som kommer in väntar förseglat tills du säger ja.": "You choose your friends. Your agent picks from your library for each of them. What comes in waits sealed until you say yes.",
      "Har du fått en kod? Dela → Hämta med en kod.": "Were you given a code? Share → Fetch with a code.",
      "{n} fil": "{n} file",
      "{n} filer": "{n} files",
      "{n} vänförfrågan": "{n} friend request",
      "{n} vänförfrågningar": "{n} friend requests",
      "{n} förslag": "{n} proposals",
      "{n} väntar på ditt ja": "{n} waiting for your yes",
      "Idag: ": "Today: ",
      "{n} från {who} gick rakt in": "{n} from {who} went straight in",
      "{n} gick rakt in": "{n} went straight in",
      "{n} vald av din agent": "{n} picked by your agent",
      "{n} valda av din agent": "{n} picked by your agent",
      "{n} delning ute": "{n} share out",
      "{n} delningar ute": "{n} shares out",
      "{m} min kvar att svara": "{m} min left to answer",
      "Telefon frågar": "A phone asks",
      "Förseglat · rött först": "Sealed · red first",
      "Ångra": "Undo",
      "Kom {t}": "Came {t}",
      "träffad": "met",
      "okänd med kod": "unknown with a code",
      "Vänförfrågningar": "Friend requests",
      "Din agent föreslår": "Your agent proposes",
      "Gröna filer från {name} stannade: något {colour} kom": "Green files from {name} stopped: something {colour} came",
      "rött": "red",
      "gult": "yellow",
      "Slå på igen": "Turn on again",
      "OK": "OK",
      "Ser din mapp": "Sees your folder",
      "{n} vald åt dig": "{n} picked for you",
      "{n} valda åt dig": "{n} picked for you",
      "{n} ny i {name}s mapp": "{n} new in {name}'s folder",
      "{n} nya i {name}s mapp": "{n} new in {name}'s folder",
      "Frågad · väntar på svar": "Asked · waiting for an answer",
      "Ta tillbaka": "Take back",
      "Förfrågan är tillbakatagen": "The request is taken back",
      "Gröna filer från {name} går rakt in": "Green files from {name} go straight in",
      "Bara filer granskningen fann rena, aldrig program. Gula och röda väntar alltid på ditt tryck. Pausas om {name} skickar något rött eller gult.": "Only files the review found clean, never programs. Yellow and red always wait for your press. Paused if {name} sends something red or yellow.",
      "{name}s mapp · hämtas till din Mac": "{name}'s folder · fetched to your Mac",
      "Uppdatera": "Refresh",
      "Hämta alla ({n})": "Fetch all ({n})",
      "Delningar till {name}: {n} ute": "Shares to {name}: {n} out",
      "Stoppa alla": "Stop all",
      "Stoppa": "Stop",
      "{n} delning stoppad": "{n} share stopped",
      "{n} delningar stoppade": "{n} shares stopped",
      "tittar": "looks",
      "föreslår": "proposes",
      "delar inom regler": "shares within rules",
      "delar fritt": "shares freely",
      "läser biblioteket": "reads the library",
      "hitta dig": "find you",
      "se mappen": "see the folder",
      "rakt in": "straight in",
      "{n} telefon": "{n} phone",
      "{n} telefoner": "{n} phones",
      "vaken": "awake",
      "startar vid inloggning": "starts at login",
      "Inga vänner än.": "No friends yet.",
      "Pausad: något {colour} kom": "Paused: something {colour} came",
      "vald av din agent": "picked by your agent",
      "delning ute": "share out",
      "gick rakt in": "went straight in",
      "pausade det gröna flödet": "paused the green flow",
      "Från din telefon": "From your phone",
      "Mötas": "Meet",
      "bara på datorn": "only on the computer",
      "Delat": "Shared",
      "Bibliotek": "Library",
      "Mappar": "Folders"
  };
  const tr = (sv, vars) => {
    let out = LANG === "en" && EN[sv] !== undefined ? EN[sv] : sv;
    if (vars) for (const k in vars) out = out.split("{" + k + "}").join(vars[k]);
    return out;
  };
  // What the agent says in its reports is Swedish, from a small fixed set of phrases (rules and reviewer).
  // In English they are rewritten here; anything not recognised is shown as it came.
  const SERVER_EN = [
    [/^sha256 stämmer inte med erbjudandet$/, () => "sha256 does not match the offer"],
    [/^storleken stämmer inte \((\d+) byte, erbjöds (\d+)\)$/, (m) => `the size does not match (${m[1]} bytes, ${m[2]} offered)`],
    [/^utger sig för (\S+) men är (.+)$/, (m) => `claims to be ${m[1]} but is ${trServer(m[2])}`],
    [/^är inte (\S+): (.+)$/, (m) => `is not ${m[1]}: ${trServer(m[2])}`],
    [/^innehåller makron$/, () => "contains macros"],
    [/^innehåller skript$/, () => "contains scripts"],
    [/^innehåller instruktioner riktade till en AI$/, () => "contains instructions aimed at an AI"],
    [/^innehåller dold eller riktningsvänd text$/, () => "contains hidden or direction-reversed text"],
    [/^(\d+) länk(ar)?$/, (m) => `${m[1]} ${m[1] === "1" ? "link" : "links"}`],
    [/^sammanfattningen från avsändaren stämmer dåligt med innehållet$/, () => "the sender's summary fits the content poorly"],
    [/^(.+), (\d+) tecken( \(utdrag\))?$/, (m) => `${trServer(m[1])}, ${m[2]} characters${m[3] ? " (excerpt)" : ""}`],
    [/^program: läses inte$/, () => "a program: not read"],
    [/^granskaren svarade inte \((.*)\)$/, (m) => `the reviewer did not answer (${m[1]})`],
    [/^(\S+) utan läsbar text \((\d+) byte\)$/, (m) => `${m[1]} without readable text (${m[2]} bytes)`],
    [/^text som inte går att läsa hela \((\d+) byte\)$/, (m) => `text that cannot be read in full (${m[1]} bytes)`],
    [/^ett program \(binärt\)$/, () => "a program (binary)"],
    [/^ett skript \(#!\)$/, () => "a script (#!)"],
    [/^okänt format$/, () => "unknown format"],
    [/^arkiv$/, () => "archive"],
    [/^länk$/, () => "link"],
    [/^program delas inte$/, () => "programs are not shared"],
    [/^finns inte i mappen$/, () => "is not in the folder"],
    [/^text – filnamnet säger (\.\w+)$/, (m) => `text – the file name says ${m[1]}`],
    [/^(.+), (\d+(?:\.\d+)? (?:B|kB|MB))$/, (m) => `${trServer(m[1])}, ${m[2]}`],
    // The owner's phone as a remote (docs/REMOTE.md): why a code cannot be made, and what is refused.
    [/^det går inte från en fjärrkontroll, bara på datorn$/, () => "that cannot be done from a remote, only on the computer"],
    [/^bara på datorns egen skärm$/, () => "only on the computer's own screen"],
    [/^bara på datorns egen skärm eller från en fjärrkontroll$/, () => "only on the computer's own screen or from a remote"],
    [/^inställningen relay_web är ingen adress som telefonen kan använda \(skriv reläets namn, utan något framför, eller en hel wss:\/\/-adress\)$/, () => "the setting relay_web is not an address the phone can use (write the relay's name, with nothing in front of it, or a whole wss:// address)"],
    [/^inställningen relay_web börjar med ws:\/\/: en telefon når bara ett relä över wss:\/\/$/, () => "the setting relay_web begins with ws://: a phone only reaches a relay over wss://"],
    [/^telefonen kunde inte sparas: det går inte att skriva i DAP-Shares mapp just nu \(är disken full\?\)\. Frågan står kvar\.$/, () => "the phone could not be stored: DAP-Share's folder cannot be written to right now (is the disk full?). The question is still there."],
    [/^listan över telefoner går inte att läsa just nu; försök igen$/, () => "the list of phones cannot be read right now; try again"],
    [/^telefonen är bortkopplad nu, men listan gick inte att spara \(är disken full\?\)\. Gör plats på disken: annars är telefonen tillbaka när DAP-Share startas om\.$/, () => "the phone is disconnected now, but the list could not be saved (is the disk full?). Make room on the disk: otherwise the phone is back when DAP-Share is started again."],
    [/^sammanhanget ska vara en kort text$/, () => "the context must be a short text"],
    [/^koden ska vara text$/, () => "the code must be text"],
    [/^identiteterna ska vara en lista med adresser \(dap:crypto:…\)$/, () => "the identities must be a list of addresses (dap:crypto:…)"],
    [/^filerna ska vara en lista med namn$/, () => "the files must be a list of names"],
    [/^telefonen når datorn genom ett relä, och den här agenten har inget$/, () => "the phone reaches the computer through a relay, and this agent has none"],
    [/^reläet är angivet som en sifferadress; telefonen behöver dess namn \(inställningen relay_web\)$/, () => "the relay is given as a number; the phone needs its name (the setting relay_web)"],
    [/^agenten har ingen skärm igång$/, () => "the agent has no screen running"],
    [/^frågan är för stor$/, () => "the question is too large"],
    [/^frågan blev aldrig klar$/, () => "the question was never finished"],
    [/^svaret är för stort för en fjärrkontroll$/, () => "the answer is too large for a remote"],
    [/^agenten har ingen delningsmapp$/, () => "the agent has no share folder"],
    [/^det där är inget filnamn$/, () => "that is not a file name"],
    [/^filen är tom$/, () => "the file is empty"],
    [/^filen är större än (.+)$/, (m) => `the file is larger than ${m[1]}`],
    [/^kan inte skriva i delningsmappen: (.*)$/, (m) => `cannot write in the share folder: ${m[1]}`],
    [/^en fil från telefonen läggs i delningsmappen eller i biblioteket, ingen annanstans$/, () => "a file from the phone goes into the share folder or the library, nowhere else"],
    [/^agenten har inget bibliotek$/, () => "the agent has no library"],
    [/^kan inte skriva i biblioteket: (.*)$/, (m) => `cannot write in the library: ${m[1]}`],
    [/^filen ligger kvar: den gick inte att flytta till papperskorgen \((.*)\)$/, (m) => `the file is still there: it could not be moved to the trash (${m[1]})`],
    [/^det där trycket är redan använt till en annan fråga$/, () => "that press has already been used for another question"],
    // The two settings of the computer itself (docs/REMOTE.md §6).
    [/^den här datorn kan inte hållas vaken av DAP-Share$/, () => "this computer cannot be kept awake by DAP-Share"],
    [/^kunde inte hålla datorn vaken$/, () => "could not keep the computer awake"],
    [/^DAP-Share kan inte startas vid inloggning härifrån$/, () => "DAP-Share cannot be started at login from here"],
    [/^kan inte skriva inloggningsfilen: (.*)$/, (m) => `cannot write the login file: ${m[1]}`],
    [/^bara på datorn$/, () => "only on the computer"],
    // The cloud's switch (docs/CLOUD.md §9.6, §9.2).
    [/^Den här reläservern har inget moln\.$/, () => "This relay has no cloud."],
    [/^Den här DAP-Share känner inte molntjänsten\.$/, () => "This DAP-Share does not know the cloud service."],
  ];
  function trServer(text) {
    if (LANG !== "en" || typeof text !== "string") return text;
    for (let i = 0; i < SERVER_EN.length; i++) { const m = SERVER_EN[i][0].exec(text); if (m) return SERVER_EN[i][1](m); }
    return text;
  }
  // The markup is written in Swedish; in English every text, placeholder, title and spoken name that has a translation is swapped once.
  (function translateStatic() {
    const link = document.getElementById("langLink");
    link.textContent = LANG === "en" ? "Svenska" : "English";
    link.href = "?lang=" + (LANG === "en" ? "sv" : "en");
    document.documentElement.lang = LANG;
    if (LANG !== "en") return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = []; let n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach((node) => {
      if (node.parentNode && node.parentNode.nodeName === "SCRIPT") return;
      const key = node.nodeValue.trim();
      if (key && EN[key] !== undefined) node.nodeValue = node.nodeValue.replace(key, EN[key]);
    });
    ["placeholder", "title", "aria-label"].forEach((a) => {
      [].forEach.call(document.querySelectorAll("[" + a + "]"), (el) => { const k = el.getAttribute(a); if (EN[k] !== undefined) el.setAttribute(a, EN[k]); });
    });
  })();

  let shelfOpen = null;    // the friend whose folder the owner is looking in
  let found = null;        // the last answer from the directory, or null before any search
  let personOpen = null;   // the friend whose page is in front
  let expanded = {};       // the rows in Waiting the owner opened: a delivery id, or "req:" + dap_id
  let discarding = {};     // Discard with five seconds of undo: delivery id -> the timer that posts it
  let pairAskHtml = "";    // the pairing question, drawn under the phones and on Hem alike
  let offlineSince = null; // when the screen first saw the relay gone, for "Offline · 2 h"
  let journalFilter = "all";
  let meOpen = false;      // the sheet under the owner's name
  // ---- one door to the agent: everything the screen asks goes through api(), and nothing else here
  // talks to the agent. On the agent's own screen that is fetch to /api/share/<name>. A page that
  // reaches the agent some other way (the owner's phone as a remote, docs/REMOTE.md §5) sets
  // window.DAP_TRANSPORT before this script starts: (method, name, body) → a promise of the answer
  // as the agent's API gives it, a refusal ({error}) included; it rejects when the agent cannot be
  // reached. `method` is "GET" or "POST" and `name` what comes after /api/share/. `body` is always
  // an object: what a POST sends, or what a GET takes as its query (place for files).
  const TRANSPORT = typeof window.DAP_TRANSPORT === "function" ? window.DAP_TRANSPORT : null;
  function api(method, name, body) {
    const what = body || {};
    if (TRANSPORT) return new Promise((resolve) => resolve(TRANSPORT(method, name, what)));
    if (method === "POST") return fetch("api/share/" + name, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(what) }).then((r) => r.json());
    const query = Object.keys(what).map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(what[k])).join("&");
    return fetch("api/share/" + name + (query ? "?" + query : "")).then((r) => r.json());
  }
  // The three folders at the top (docs/SCREEN.md §1). On the computer the agent shows a folder in
  // Finder. A page that carries the screen somewhere else (the owner's phone) and has its own way to
  // show what is in a folder sets window.DAP_FOLDER before this script starts: (place), with place
  // "share", "received" or "library". Without it a remote has no such button.
  const FOLDER = typeof window.DAP_FOLDER === "function" ? window.DAP_FOLDER : null;
  // A press is taken once: the button that was pressed stays off until the agent has answered.
  // On the computer that is a blink; through a phone's line it can be seconds, and a second
  // press of Share would be a second share.
  let pressed = null;
  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!b) return;
    pressed = b;
    setTimeout(() => { if (pressed === b) pressed = null; }, 0);
  }, true);
  const post = (p, body) => {
    const b = pressed;
    pressed = null;
    const asked = api("POST", p, body);
    // A press from the owner's phone whose withdrawal from the cloud waits for the computer to reach it
    // (docs/CLOUD.md §5.6): said after whatever the press itself says.
    asked.then((r) => { if (r && r.cloud_later === true) setTimeout(() => toast(tr("Görs i molnet när datorn når det")), 0); }, () => {});
    if (!b || b.disabled) return asked;
    b.disabled = true;
    b.setAttribute("aria-busy", "true");
    const back = () => { b.disabled = false; b.removeAttribute("aria-busy"); };
    asked.then(back, back);
    return asked;
  };
  // What names one share when it is stopped: the agent builds the same from what it holds, so a
  // list that changed on another screen never makes Stop hit another share.
  const policyKey = (p) => [p.audience, p.valid_until].concat((p.items || []).map((it) => it.id)).join("|");
  const loader = (text) => `<span class="loader"><picture><source srcset="icon.svg" media="(prefers-reduced-motion: reduce)"><img src="icon-animated.svg" alt="" width="28" height="28"></picture><span>${esc(text)}</span></span>`;
  const busy = (text) => { const b = $("busy"); if (text) { b.innerHTML = loader(text); b.style.display = "block"; } else { b.style.display = "none"; b.innerHTML = ""; } };
  const toast = (msg) => { const t = $("toast"); t.textContent = msg; t.style.display = "block"; clearTimeout(toast.t); toast.t = setTimeout(() => (t.style.display = "none"), 4000); };
  const kb = (n) => (n < 1024 ? n + " B" : n < 1048576 ? Math.round(n / 1024) + " kB" : (n / 1048576).toFixed(1) + " MB");
  const when = (iso) => new Date(typeof iso === "number" ? iso * 1000 : iso).toLocaleTimeString(LOCALE);
  let state = null;
  let stateAsked = 0;    // when the state that is here was asked for
  let relayFilled = false;
  let remoteCode = null; // the pairing code this page was given: { expires_at, made }. The agent never repeats a code.
  let removeAsk = null;  // the phone the owner pressed Remove on, until the second press
  let folderSeen = false;
  // What is drawn again every other second is only written when it has changed: a button is not replaced under a press.
  const setHtml = (el, html) => { if (el.dapHtml !== html) { el.innerHTML = html; el.dapHtml = html; } };
  const day = (seconds) => new Date(seconds * 1000).toLocaleDateString(LOCALE, { year: "numeric", month: "short", day: "numeric" });
  const dayTime = (seconds) => new Date(seconds * 1000).toLocaleString(LOCALE, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const COLOUR_ORDER = { red: 0, yellow: 1, green: 2 };
  const AUD = () => ({ MET_IN_PERSON: tr("den jag träffar fysiskt"), FRIENDS: tr("vänner"), LISTED: tr("namngivna"), ANYONE_WITH_CODE: tr("den som har koden") });
  const LEVEL = () => ({ 0: tr("nivå 0, titta: ser mappen och läget, inget mer"), 1: tr("nivå 1, föreslå: lägger förslag här, du säger ja eller nej"), 2: tr("nivå 2, inom regler: delar själv, men bara inom dina regler"), 3: tr("nivå 3: delar själv med vänner, utan gränser") });
  // The agent's level in one word, for the row under Settings and the status line's sheet.
  const levelWord = (adv) => (adv.off ? tr("av") : tr(or({ 0: "tittar", 1: "föreslår", 2: "delar inom regler", 3: "delar fritt" }[adv.level], String(adv.level))));

  // ---- the owner's phone as a remote (docs/REMOTE.md §2): the phones, the code to scan, and the
  // question with the four digits. `rc` is undefined everywhere but on the computer's own screen. ----
  function renderRemote(rc, asked) {
    $("remoteCard").hidden = !rc;
    $("rowPhone").hidden = !rc;
    if (!rc) { setHtml($("pairAsk"), ""); pairAskHtml = ""; return; }
    // A phone waits for the owner's yes: asked under the phones and on Hem. The digits are the
    // session's own; somebody in the middle cannot make the phone show the same ones. The question
    // is answered within five minutes of the scan, and the card says how many are left.
    const p = rc.pairing;
    const left = p && p.asked_at ? Math.max(0, Math.ceil((p.asked_at + 300 - Date.now() / 1000) / 60)) : null;
    pairAskHtml = p
      ? `<div class="meeting"><div><b>${esc(tr("En telefon vill bli din fjärrkontroll"))}</b><div class="pairName">${esc(tr("Den kallar sig {name}", { name: p.name }))}</div><div class="digits" id="pairDigits">${esc(p.digits)}</div><div class="small">${esc(tr("Tryck ja bara om din egen telefon just nu visar samma fyra siffror. Visar den något annat, eller ingenting: tryck nej. En fjärrkontroll får göra allt du gör här, utom att ändra inställningarna."))}</div><div class="small">${esc(left === null ? "" : tr("{m} min kvar att svara", { m: left }))}</div></div><div><button data-pair-yes="${esc(p.id)}">${esc(tr("Ja, tillåt"))}</button> <button class="quiet" data-pair-no="${esc(p.id)}">${esc(tr("Nej"))}</button></div></div>`
      : "";
    setHtml($("pairAsk"), pairAskHtml);
    // The code stays up while the agent says that very code is out: used, run out or taken back, it goes.
    // (A state that was asked for before the code was made says nothing about it.)
    if (remoteCode && asked > remoteCode.made && !(rc.code && rc.code.expires_at === remoteCode.expires_at)) remoteCode = null;
    const showing = !!remoteCode && !p;
    const full = rc.phones.length >= rc.max;
    $("remotePair").hidden = !showing;
    if (showing) $("remoteUntil").textContent = tr("Koden gäller en gång, i fem minuter: till {t}.", { t: new Date(remoteCode.expires_at * 1000).toLocaleTimeString(LOCALE) });
    $("remotePairBtn").hidden = showing || !!p;
    $("remotePairBtn").disabled = full;
    const hint = full ? tr("Alla {max} platserna är tagna. Ta bort en telefon för att ansluta en ny.", { max: rc.max })
      : !rc.available ? tr("Just nu kan ingen kod göras: telefonen når datorn genom agentens relä, och det saknas eller har inget namn.") : "";
    $("remoteHint").hidden = !hint;
    $("remoteHint").textContent = hint;
    $("phoneVal").textContent = tr(rc.phones.length === 1 ? "{n} telefon" : "{n} telefoner", { n: rc.phones.length });
    if (removeAsk && !rc.phones.some((x) => x.dap_id === removeAsk)) removeAsk = null;
    setHtml($("remotePhones"), rc.phones.length
      ? rc.phones.map((x) => `<div class="srow"><span><b>${esc(x.name)}</b> <span class="badge${x.online ? "" : " off"}">${esc(tr(x.online ? "ansluten nu" : "inte ansluten nu"))}</span><div class="small">${esc(tr("Tillagd {a} · senast använd {b}", { a: day(x.added), b: dayTime(x.last_seen) }))}</div></span>` +
          (removeAsk === x.dap_id
            ? `<span class="confirm"><span class="small">${esc(tr("Ta bort {name}? Den kommer inte in igen förrän du ansluter den på nytt.", { name: x.name }))}</span><button class="danger tiny" data-phone-remove-yes="${esc(x.dap_id)}">${esc(tr("Ja, ta bort"))}</button> <button class="quiet tiny" data-phone-remove-no="1">${esc(tr("Avbryt"))}</button></span>`
            : `<button class="danger tiny" data-phone-remove="${esc(x.dap_id)}">${esc(tr("Ta bort"))}</button>`) + `</div>`).join("")
      : `<div class="empty">${esc(tr("Ingen telefon är ansluten än."))}</div>`);
  }

  // ---- what waits for the owner's yes (docs/SCREEN.md §2.3): the sealed deliveries, the friend
  // requests, the advisor's proposals. A delivery on its way to the bin (five seconds of undo) is not counted. ----
  function waitingNow() {
    const held = state.inbox.filter((d) => d.status === "held" && !discarding[d.id]);
    const requests = state.friend_requests || [];
    const proposals = state.advisor ? state.advisor.proposals.filter((p) => p.status === "pending") : [];
    const green = held.filter((d) => d.report.colour === "green" && !d.report.executable);
    return { held, requests, proposals, green, total: held.length + requests.length + proposals.length };
  }
  // The sender's lane in words: a friend, somebody met in the room (their code was scanned), or somebody with a code.
  function laneWord(d) {
    if (d.lane === "friend") return tr("vän");
    const met = (state.sessions || []).some((s) => s.peer && s.peer.dap_id === d.sender.dap_id && s.proximity);
    return tr(met ? "träffad" : "okänd med kod");
  }
  const worst = (deliveries) => deliveries.map((d) => d.report.colour).sort((a, b) => or(COLOUR_ORDER[a], 1) - or(COLOUR_ORDER[b], 1))[0];
  // A friend whose standing yes paused (docs/SCREEN.md §4.3): the line and its two answers. Only the computer may turn it on again.
  const pausedHtml = (c, far) => `<div class="paused"><span>${esc(tr("Gröna filer från {name} stannade: något {colour} kom", { name: c.display_name, colour: tr(c.paused.colour === "red" ? "rött" : "gult") }))}</span><span>${far ? "" : `<button data-direction="${esc(c.dap_id)}" data-on="1">${esc(tr("Slå på igen"))}</button> `}<button class="quiet" data-direction="${esc(c.dap_id)}" data-on="0">${esc(tr("OK"))}</button></span></div>`;
  // The two questions the owner answers once (docs/SCREEN.md §2.5), the same words wherever they are asked.
  const questionList = () => `<div class="meeting"><div><b>${esc(tr("Ska andra kunna hitta dig?"))}</b><div class="small">${esc(tr("Den som har appen kan se ditt namn och skicka en vänförfrågan. Bara vänner du accepterar ser dina filer. Du kan ändra dig under Vänner."))} <a href="${esc(PRIVACY)}" target="_blank" rel="noopener">${esc(tr("Vad som visas och sparas"))}</a></div></div><div><button data-listed="yes">${esc(tr("Ja, gör mig synlig"))}</button> <button class="quiet" data-listed="no">${esc(tr("Nej"))}</button></div></div>`;
  const questionLive = () => `<div class="meeting"><div><b>${esc(tr("Ska dina vänner se din delningsmapp?"))}</b><div class="small">${esc(tr("Då kan vänner du har accepterat hämta det som ligger i mappen, utan att du delar fil för fil. Ingen annan ser den. Du kan ändra dig under Vänner."))}</div></div><div><button data-live="yes">${esc(tr("Ja, visa den för mina vänner"))}</button> <button class="quiet" data-live="no">${esc(tr("Nej, jag väljer själv varje gång"))}</button></div></div>`;
  // How many files a friend's folder held the last time the owner looked at it: for "N nya" in the friend's row. Best effort.
  const seenKey = (dap_id) => "dap_seen_" + dap_id;
  const seenCount = (dap_id) => { try { const v = localStorage.getItem(seenKey(dap_id)); return v === null ? null : Number(v); } catch (e) { return null; } };
  const rememberSeen = (dap_id, n) => { try { localStorage.setItem(seenKey(dap_id), String(n)); } catch (e) {} };

  // ---- Home (docs/SCREEN.md §2): the status line, the sheet, the one button, the green bar, the soft line ----
  function renderHome(far, w) {
    const adv = state.advisor;
    const parts = [];
    if (adv) parts.push(tr(adv.off ? "Agent av" : "Agent på"));
    // The cloud's one part (docs/CLOUD.md §9.6), only when it is on; the agent tells only the computer's own screen.
    const dep = far ? null : state.me.deputy;
    if (dep && dep.on) parts.push(cloudNeedsYou(dep) ? tr("Molnet behöver dig") : !dep.deputy ? tr(dep.invite === 429 ? "Molnet väntar på plats" : dep.invite ? "Molnet väntar på en inbjudan" : "Molnet görs") : dep.sending ? tr("Molnet {p} %", { p: cloudPercent(dep.sending) }) : tr("Molnet på"));
    const online = state.me.relay_status === "registered" || state.me.relay_status === "connected";
    if (state.me.relay && !online) {
      if (!offlineSince) offlineSince = Date.now();
      const h = Math.floor((Date.now() - offlineSince) / 3600000);
      parts.push(h >= 1 ? tr("Offline · {h} h", { h }) : tr("Offline"));
    } else {
      offlineSince = null;
      parts.push(w.total ? tr("{n} väntar", { n: w.total }) : tr("Inget väntar"));
    }
    setHtml($("statusRest"), parts.length ? " · " + parts.map((p) => `<span class="part">${esc(p)}</span>`).join(" · ") : "");
    $("meSheet").hidden = !meOpen;
    $("relayLine").textContent = state.me.relay ? tr("Krypterat hela vägen via {host}", { host: state.me.relay.relay.host }) : tr("Inget relä");
    $("levelLine").hidden = !adv;
    if (adv) $("levelWords").textContent = adv.off ? tr("Avstängd. Ingen AI-agent kommer åt DAP-Share.") : or(LEVEL()[adv.level], String(adv.level));
    $("versionLine").textContent = or(state.me.version, "");
    $("aboutVersion").textContent = or(state.me.version, "");
    const friends = state.contacts.filter((c) => c.lane === "friend");
    setHtml($("underLine"), w.total
      ? `<div>${esc(tr("Förseglat tills du säger ja."))}</div>`
      : `<div>${esc(tr("Du väljer dina vänner. Din agent väljer ur ditt bibliotek åt var och en. Det som kommer in väntar förseglat tills du säger ja."))}</div>` + (friends.length ? "" : `<div>${esc(tr("Har du fått en kod? Dela → Hämta med en kod."))}</div>`));
    // The one button: a phone that asks comes first, in white; otherwise the count and its split.
    const notice = $("homeNotice");
    if (pairAskHtml) {
      notice.className = "notice pair";
      setHtml(notice, pairAskHtml.replace(' id="pairDigits"', ""));
      notice.hidden = false;
    } else if (w.total) {
      const split = [];
      if (w.held.length) split.push(tr(w.held.length === 1 ? "{n} fil" : "{n} filer", { n: w.held.length }));
      if (w.requests.length) split.push(tr(w.requests.length === 1 ? "{n} vänförfrågan" : "{n} vänförfrågningar", { n: w.requests.length }));
      if (w.proposals.length) split.push(tr("{n} förslag", { n: w.proposals.length }));
      notice.className = "notice";
      setHtml(notice, `<button class="noticeBtn" data-go="waiting"><b>${esc(tr("{n} väntar på ditt ja", { n: w.total }))}</b><span class="small">${esc(split.join(" · "))}</span></button>`);
      notice.hidden = false;
    } else { notice.hidden = true; notice.className = "notice"; setHtml(notice, ""); }
    // Two or more green files: one press lets them in; above ten the list is shown first.
    $("greenBar").hidden = w.green.length < 2;
    $("greenBar").textContent = tr("Släpp in de gröna ({n})", { n: w.green.length });
    $("greenBar").dataset.greenAll = String(w.green.length);
    $("tabCount").hidden = !w.total;
    $("tabCount").textContent = String(w.total);
    // The soft line: what happened today, a part with a zero left out. An agent without `today` (the Node agent) shows none.
    const today = state.today;
    const soft = [];
    if (today) {
      if (today.straight_in) {
        const names = [];
        (today.lines || []).forEach((l) => { if (l.kind === "straight_in" && l.display_name && names.indexOf(l.display_name) < 0) names.push(l.display_name); });
        soft.push(`<button data-journal="straight_in">${esc(names.length === 1 ? tr("{n} från {who} gick rakt in", { n: today.straight_in, who: names[0] }) : tr("{n} gick rakt in", { n: today.straight_in }))}</button>`);
      }
      if (today.picked) soft.push(`<button data-journal="sent">${esc(tr(today.picked === 1 ? "{n} vald av din agent" : "{n} valda av din agent", { n: today.picked }))}</button>`);
      if (today.out) soft.push(`<button data-go="share">${esc(tr(today.out === 1 ? "{n} delning ute" : "{n} delningar ute", { n: today.out }))}</button>`);
    }
    $("softLine").hidden = !soft.length;
    setHtml($("softLine"), soft.length ? esc(tr("Idag: ")) + soft.join(" · ") : "");
  }

  // ---- Waiting (docs/SCREEN.md §3): four groups, a group absent when empty; the paused standing yes; the two questions ----
  function renderWaiting(far, w, askHtml) {
    setHtml($("waitPair"), pairAskHtml ? `<h3 class="how">${esc(tr("Telefon frågar"))}</h3>` + pairAskHtml.replace(' id="pairDigits"', "") : "");
    // Sealed: every held delivery, red first, then yellow, then green, the newest last. A row on its
    // way to the bin says so and offers Undo; a row tapped opens the review's words under it.
    const rows = state.inbox.filter((d) => d.status === "held").sort((a, b) => (or(COLOUR_ORDER[a.report.colour], 1) - or(COLOUR_ORDER[b.report.colour], 1)) || (a.received_at < b.received_at ? -1 : a.received_at > b.received_at ? 1 : 0));
    setHtml($("meetings"), rows.length ? `<h3 class="how">${esc(tr("Förseglat · rött först"))}</h3>` + rows.map((d) => {
      if (discarding[d.id]) return `<div class="wrow"><div class="wmain"><b>${esc(d.item.filename)}</b><div class="small">${esc(tr("Kastad"))}</div></div><div class="wbtns"><button class="quiet" data-undo="${esc(d.id)}">${esc(tr("Ångra"))}</button></div></div>`;
      const open = !!expanded[d.id];
      const can = d.report.colour !== "red" && !d.report.executable;
      const who = or(d.sender.display_name, d.sender.dap_id);
      const words = [].concat(or(d.report.findings, []), or(d.report.notes, [])).map((x) => esc(trServer(x))).join("<br>") || esc(trServer(d.report.what));
      return `<div class="wrow${open ? " open" : ""}" data-item="${esc(d.id)}"><div class="wmain"><span class="dot ${esc(d.report.colour)}"></span><b>${esc(d.item.filename)}</b><div class="small">${esc(who)} · ${esc(laneWord(d))} · ${esc(kb(d.item.size_bytes || 0))}</div></div><div class="wbtns">${can ? `<button data-release="${esc(d.id)}">${esc(tr("Släpp in"))}</button>` : ""}<button class="danger" data-discard="${esc(d.id)}">${esc(tr("Kasta"))}</button></div></div>`
        + (open ? `<div class="exp">${words}<span class="small">${esc(tr("Kom {t}", { t: when(d.received_at) }))}</span>${d.lane === "friend" ? "" : `<button class="quiet tiny" data-block="${esc(d.sender.dap_id)}" data-block-name="${esc(who)}">${esc(tr("Blockera"))}</button>`}</div>` : "");
    }).join("") : "");
    // Friend requests: a row tapped offers Block too. Over ten an hour are counted, not shown.
    const reqs = state.friend_requests || [];
    setHtml($("requests"), (reqs.length ? `<h3 class="how">${esc(tr("Vänförfrågningar"))}</h3>` : "") + reqs.map((r) => {
      const open = !!expanded["req:" + r.dap_id];
      return `<div class="meeting" data-item="${esc("req:" + r.dap_id)}"><div>${esc(tr("Vänförfrågan från"))} <b>${esc(r.display_name)}</b><div class="mono">${esc(r.dap_id)}</div></div><div><button data-accept="${esc(r.dap_id)}">${esc(tr("Acceptera"))}</button> <button class="quiet" data-decline="${esc(r.dap_id)}">${esc(tr("Avböj"))}</button>${open ? ` <button class="quiet" data-block="${esc(r.dap_id)}" data-block-name="${esc(r.display_name)}">${esc(tr("Blockera"))}</button>` : ""}</div></div>`;
    }).join("") + (state.requests_held_back ? `<div class="small" style="margin:0 0 8px">${esc(tr(state.requests_held_back === 1 ? "1 vänförfrågan till hölls tillbaka den senaste timmen (högst 10 nya i timmen)." : "{n} vänförfrågningar till hölls tillbaka den senaste timmen (högst 10 nya i timmen).", { n: state.requests_held_back }))}</div>` : ""));
    // What the agent proposes: the file names are on the row before Share can be pressed.
    const aud = AUD();
    setHtml($("asks"), (w.proposals.length ? `<h3 class="how">${esc(tr("Din agent föreslår"))}</h3>` : "") + w.proposals.map((p) => `<div class="meeting"><div>${esc(tr("Din AI-agent föreslår att du delar"))} <b>${p.files.map(esc).join(", ")}</b><div class="small">${esc(tr("till {who} i {h} h", { who: or(aud[p.audience], p.audience), h: p.hours }))}${p.context ? " · " + esc(p.context) : ""}${p.listed ? " · " + esc(tr("{n} identiteter", { n: p.listed.length })) : ""}${p.note ? " · ”" + esc(p.note) + "”" : ""} · ${when(p.at)}</div>${p.audience === "ANYONE_WITH_CODE" ? `<div class="row"><input data-code-for="${esc(p.id)}" placeholder="${esc(tr("kod (minst 6 tecken) – du väljer den, inte rådgivaren"))}"></div>` : ""}</div><div><button data-accept-proposal="${esc(p.id)}">${esc(tr("Dela"))}</button> <button class="quiet" data-reject-proposal="${esc(p.id)}">${esc(tr("Avböj"))}</button></div></div>`).join(""));
    const paused = state.contacts.filter((c) => c.paused);
    setHtml($("pausedBox"), paused.map((c) => pausedHtml(c, far)).join(""));
    setHtml($("waitAsk"), askHtml);
    $("waitEmpty").hidden = !!(w.total || pairAskHtml || paused.length);
    $("receivedBtn").hidden = far;
  }

  // ---- Friends (docs/SCREEN.md §5.1): one row per friend with what flows, the ones asked, nearby, the folds ----
  function renderFriends(far, w) {
    const live = state.me.live_folder;
    const shelves = state.shelves || [];
    const friendIds = {}; state.contacts.forEach((c) => { friendIds[c.dap_id] = true; });
    setHtml($("contacts"), state.contacts.map((c) => {
      const sh = shelves.filter((x) => x.dap_id === c.dap_id)[0];
      const picked = sh ? sh.items.filter((it) => it.picked).length : 0;
      const liveN = sh ? sh.items.filter((it) => it.live).length : 0;
      const seen = seenCount(c.dap_id);
      const fresh = seen === null ? liveN : Math.max(0, liveN - seen);
      const mine = w.held.filter((d) => d.sender.dap_id === c.dap_id);
      const parts = [];
      if (c.lane !== "friend") parts.push(esc(tr("främling")));
      else if (live === true) parts.push(esc(tr("Ser din mapp")));
      const nums = [];
      if (picked) nums.push(esc(tr(picked === 1 ? "{n} vald åt dig" : "{n} valda åt dig", { n: picked })));
      if (fresh) nums.push(esc(tr(fresh === 1 ? "{n} ny i {name}s mapp" : "{n} nya i {name}s mapp", { n: fresh, name: c.display_name })));
      if (mine.length) nums.push(`<span class="dot ${esc(worst(mine))}"></span>` + esc(tr("{n} väntar", { n: mine.length })));
      const line = parts.concat(nums.slice(0, 2)).join(" · "); // at most two numbers
      return `<button class="frow" data-person="${esc(c.dap_id)}"><span class="fname">${esc(c.display_name)}${c.lane === "friend" && c.receive_without_button ? '<i class="check">✓</i>' : ""}</span>${line ? `<span class="small">${line}</span>` : ""}</button>`;
    }).join("") || `<div class="empty">${esc(tr("Inga kontakter."))}</div>`);
    // The owner's own unanswered requests, with Take back.
    const names = state.asked_names || {};
    const waitingFor = (state.asked || []).filter((a) => !friendIds[a]);
    setHtml($("asked"), waitingFor.map((a) => `<div class="frow asked"><span>${esc(or(names[a], a))} · ${esc(tr("Frågad · väntar på svar"))}</span><button class="quiet tiny" data-unask="${esc(a)}">${esc(tr("Ta tillbaka"))}</button></div>`).join(""));
    $("nearbyHead").textContent = tr(far ? "I närheten · samma wi-fi som datorn" : "I närheten · samma wi-fi");
    const metOnly = state.met.filter((m) => !state.contacts.some((c) => c.dap_id === m.dap_id));
    $("metFold").textContent = tr("Träffade ({n})", { n: metOnly.length });
    setHtml($("met"), metOnly.length ? esc(tr("Träffade: ")) + metOnly.map((m) => `${esc(m.display_name)} <button class="quiet" data-befriend="${esc(m.dap_id)}">${esc(tr("gör till vän"))}</button>`).join(" · ") : `<div class="empty">${esc(tr("Tomt."))}</div>`);
    const blockedNow = state.blocked || [];
    $("blockedFold").textContent = tr("Blockerade ({n})", { n: blockedNow.length });
    setHtml($("blockedList"), blockedNow.length
      ? `<div class="small" style="margin-top:4px">${esc(tr("Blockerade. De får inget från dig och deras förfrågningar visas inte. De får inte veta att de är blockerade."))}</div>` +
        blockedNow.map((b) => `<div class="srow"><span>${esc(b.display_name)} <span class="mono small">${esc(b.dap_id)}</span></span><button class="quiet tiny" data-unblock="${esc(b.dap_id)}">${esc(tr("Häv blockering"))}</button></div>`).join("")
      : `<div class="empty">${esc(tr("Tomt."))}</div>`);
  }

  // ---- One friend (docs/SCREEN.md §5.2): the switch of §4, the friend's folder, the shares to them, and the red buttons ----
  function renderPerson(far) {
    if (!personOpen) return;
    const c = state.contacts.filter((x) => x.dap_id === personOpen)[0];
    if (!c) { personOpen = null; if (view === "person") go("friends"); return; }
    const friend = c.lane === "friend";
    const on = !!c.receive_without_button;
    setHtml($("personHead"), `<h2 class="t">${esc(c.display_name)}</h2><div class="addr"><span class="mono">${esc(c.dap_id)}</span> <button class="quiet tiny" data-copy="${esc(c.dap_id)}">${esc(tr("Kopiera"))}</button></div>${c.interests ? `<div class="likes">${esc(tr("Gillar: "))}${esc(c.interests)}</div>` : ""}`
      + (friend ? `<div class="srow" style="margin-top:14px"><span>${esc(tr("Gröna filer från {name} går rakt in", { name: c.display_name }))}<span class="small why">${esc(tr("Bara filer granskningen fann rena, aldrig program. Gula och röda väntar alltid på ditt tryck. Pausas om {name} skickar något rött eller gult.", { name: c.display_name }))}</span></span><span class="sset"><span class="badge${on ? "" : " off"}">${esc(tr(on ? "på" : "av"))}</span> <button class="quiet tiny" data-direction="${esc(c.dap_id)}" data-on="${on ? "0" : "1"}"${far && !on ? " disabled" : ""}>${esc(tr(on ? "Stäng av" : "Slå på"))}</button></span></div>` : "")
      + (c.paused ? pausedHtml(c, far) : ""));
    // The friend's folder, as the shelf draws it: live and picked marks, Fetch per item, Fetch all.
    const sh = (state.shelves || []).filter((x) => x.dap_id === c.dap_id)[0];
    setHtml($("personShelf"), friend && state.me.live_folder !== undefined ? `<div class="srow" style="margin-top:14px"><span>${esc(tr("{name}s mapp · hämtas till din Mac", { name: c.display_name }))}</span><button class="quiet tiny" data-browse="${esc(c.dap_id)}">${esc(tr(sh ? "Uppdatera" : "Visa mappen"))}</button></div>` : "");
    if (view === "person" && sh) rememberSeen(c.dap_id, sh.items.filter((it) => it.live).length);
    const shelfRow = (it) => `<tr><td>${esc(it.filename)}<div class="small">${esc(or(KIND_NAMES[it.kind], it.kind))} · ${kb(it.size_bytes)}${it.picked ? " · " + esc(tr("Utvalt åt dig")) : it.live ? " · " + esc(tr("I mappen")) : ""}</div></td><td style="text-align:right">${it.have ? esc(tr("du har den")) : `<button class="quiet" data-fetch="${esc(it.id)}">${esc(tr("Hämta"))}</button>`}</td></tr>`;
    const missing = sh ? sh.items.filter((it) => !it.have).length : 0;
    // Through a friend's deputy: the folder as it was when their computer last signed it (docs/CLOUD.md §6.3, 6).
    const asOf = sh && sh.via === "deputy" && sh.as_of ? `<div class="small">${esc(tr("Som det var {date}", { date: day(Date.parse(sh.as_of) / 1000) }))}${sh.left_out > 0 ? esc(tr(" och {n} till när {name}s dator är på", { n: sh.left_out, name: c.display_name })) : ""}</div>` : "";
    setHtml($("shelf"), sh
      ? asOf + (sh.items.length ? `<table><tbody>${sh.items.map(shelfRow).join("")}</tbody></table>` : `<div class="empty">${esc(tr("Inget just nu."))}</div>`) + (missing ? `<button class="quiet full" data-fetch-all="1">${esc(tr("Hämta alla ({n})", { n: missing }))}</button>` : "")
      : "");
    // Shares that name only this friend, and the ways to end the friendship.
    const forThem = state.policies.filter((p) => p.audience === "LISTED" && p.listed && p.listed.length && p.listed.every((id) => id === c.dap_id)); // only this friend, however many times
    setHtml($("personFoot"), (forThem.length ? `<div class="srow" style="margin-top:14px"><span>${esc(tr("Delningar till {name}: {n} ute", { name: c.display_name, n: forThem.length }))}</span><button class="danger tiny" data-remove-for="${esc(c.dap_id)}">${esc(tr("Stoppa alla"))}</button></div>` : "")
      + `<div class="row" style="margin-top:18px">${friend ? `<button class="quiet" data-demote="${esc(c.dap_id)}">${esc(tr("Gör till främling"))}</button>` : ""}<button class="danger" data-remove="${esc(c.dap_id)}">${esc(tr("Ta bort"))}</button><button class="danger" data-block="${esc(c.dap_id)}" data-block-name="${esc(c.display_name)}">${esc(tr("Blockera"))}</button></div>`);
  }

  // ---- Share (docs/SCREEN.md §6): what is out now, with Stop per share ----
  function renderShare() {
    const aud = AUD();
    const byAdvisor = new Set(((state.advisor && state.advisor.shares) || []).map((s) => s.index));
    $("shareNext").hidden = !state.policies.length;
    $("sendBox").hidden = !state.policies.length;
    // The code of the share just made, large, for reading out loud. Only this page knows it.
    $("codeBig").hidden = !(lastCode && state.policies.some((p) => p.audience === "ANYONE_WITH_CODE"));
    $("codeBig").textContent = lastCode || "";
    if (view === "send" && step === 3 && !state.policies.length) setStep(1); // the last share was stopped
    $("policies").className = state.policies.length ? "" : "empty";
    setHtml($("policies"), state.policies.length
      ? state.policies.map((p, i) => `<div class="meeting"><div><b>${p.items.map((it) => esc(it.filename)).join(", ")}</b><div class="small">${esc(tr("till {who}", { who: or(aud[p.audience], p.audience) }))}${p.context ? " · " + esc(p.context) : ""}${p.listed ? " · " + esc(tr("{n} identiteter", { n: p.listed.length })) : ""} · ${esc(tr("till {when}", { when: new Date(p.valid_until).toLocaleString(LOCALE) }))}${byAdvisor.has(i) ? " · <b>" + esc(tr("delat av rådgivaren")) + "</b>" : ""}</div></div><button class="danger" data-unshare="${i}" data-what="${esc(policyKey(p))}">${esc(tr("Stoppa"))}</button></div>`).join("")
      : esc(tr("inget")));
    $("liveNote").hidden = state.me.live_folder !== true;
  }

  // ---- Settings (docs/SCREEN.md §7): the value of each row, and the standing yes per friend ----
  function renderSettings(far) {
    const adv = state.advisor, comp = far ? undefined : state.me.computer;
    $("rowAdvisor").hidden = !adv;
    if (adv) $("advisorVal").textContent = levelWord(adv) + (!adv.off && adv.read_library !== false ? " · " + tr("läser biblioteket") : "");
    $("rowLikes").hidden = state.me.interests === undefined;
    const dir = state.me.directory;
    const friends = state.contacts.filter((c) => c.lane === "friend");
    const allow = [];
    if (dir && dir.listed) allow.push(tr("hitta dig"));
    if (state.me.live_folder) allow.push(tr("se mappen"));
    if (friends.some((c) => c.receive_without_button)) allow.push(tr("rakt in"));
    $("allowVal").textContent = allow.join(" · ");
    $("rowConnect").hidden = !(adv && adv.connect && !adv.off && !far);
    $("rowComputer").hidden = far;
    const cv = [];
    if (comp && comp.keep_awake && comp.keep_awake.on) cv.push(tr("vaken"));
    if (comp && comp.start_at_login && comp.start_at_login.on) cv.push(tr("startar vid inloggning"));
    $("computerVal").textContent = cv.join(" · ");
    $("aboutVal").textContent = LANG === "en" ? "English" : "Svenska";
    renderCloud(far);
    setHtml($("allowFriends"), friends.map((c) => {
      const on = !!c.receive_without_button;
      return `<div class="srow"><span>${esc(c.display_name)}${c.paused ? `<span class="small why">${esc(tr("Pausad: något {colour} kom", { colour: tr(c.paused.colour === "red" ? "rött" : "gult") }))}</span>` : ""}</span><span class="sset"><span class="badge${on ? "" : " off"}">${esc(tr(on ? "på" : "av"))}</span> <button class="quiet tiny" data-direction="${esc(c.dap_id)}" data-on="${on ? "0" : "1"}"${far && !on ? " disabled" : ""}>${esc(tr(on ? "Stäng av" : "Slå på"))}</button></span></div>`;
    }).join("") || `<div class="empty">${esc(tr("Inga vänner än."))}</div>`);
  }

  // ---- The cloud (docs/CLOUD.md §9.6): one row under Settings and its page. `d` is me.deputy, which
  // the agent gives only to the computer's own screen; a remote and a lan screen have neither. ----
  const cloudNeedsYou = (d) => !!(d.other_install || d.removed_changes > 0);
  const cloudPercent = (s) => Math.min(100, Math.floor((s.done / Math.max(1, s.total)) * 100));
  // An amount of bytes as the page says it: "1,4 GB" in Swedish, "1.4 GB" in English.
  const cloudSize = (n) => {
    const units = [[1073741824, "GB"], [1048576, "MB"], [1024, "kB"]];
    for (let i = 0; i < units.length; i++) if (n >= units[i][0]) return (n / units[i][0]).toLocaleString(LOCALE, { maximumFractionDigits: 1 }) + " " + units[i][1];
    return n + " B";
  };
  // A day as the page says it: "14 dec" / "14 Dec".
  const cloudDay = (iso) => { const t = Date.parse(iso); return isNaN(t) ? "" : new Date(t).toLocaleDateString(LOCALE, { day: "numeric", month: "short" }).replace(/\.$/, ""); };
  let cloudOpen = {};      // the lists on the cloud page the owner opened: "only", "dropped", "removed"
  function renderCloud(far) {
    const d = far ? undefined : state.me.deputy;
    $("cloudRow").hidden = !d;
    if (!d) { setHtml($("cloudLines"), ""); if (view === "cloud") go("settings"); return; }
    const n = (x) => (typeof x === "number" && x > 0 ? x : 0);
    $("cloudVal").textContent = !d.on && !d.relay_has ? tr("inget moln här")
      : !d.on ? tr("av")
      : cloudNeedsYou(d) ? tr("behöver dig")
      : !d.deputy ? tr(d.invite === 429 ? "väntar på plats" : d.invite ? "väntar på inbjudan" : "görs")
      : d.full ? tr("fullt")
      : d.sending ? tr("skickar {p} %", { p: cloudPercent(d.sending) })
      : n(d.waiting) ? tr(n(d.waiting) === 1 ? "{n} ändring på väg" : "{n} ändringar på väg", { n: n(d.waiting) })
      : tr("på");
    // The switch: there to turn on where the relay has a cloud; the red button at the end turns it off.
    $("cloudSwitch").hidden = !d.on && !d.relay_has;
    $("cloudBadge").textContent = tr(d.on ? "på" : "av");
    $("cloudBadge").className = "badge" + (d.on ? "" : " off");
    $("cloudOnBtn").hidden = d.on || !d.relay_has;
    $("cloudOffBtn").hidden = !d.on;
    const lines = [];
    const line = (html) => lines.push(`<div class="srow cloudLine"><span>${html}</span></div>`);
    const list = (key, head, rows) => lines.push(`<button class="fold${cloudOpen[key] ? " open" : ""}" data-cloud-list="${key}">${head}</button>` + (cloudOpen[key] ? `<div class="foldBody">${rows}</div>` : ""));
    if (d.sending && d.sending.eta === null) line(esc(tr("Det här skickas: {size}. Hur lång tid det tar visas när det har börjat.", { size: cloudSize(d.sending.total) })));
    if (d.sending && d.sending.eta !== null) line(esc(tr("Skickar {p} % · cirka {m} min kvar", { p: cloudPercent(d.sending), m: Math.max(1, Math.ceil(d.sending.eta / 60)) })));
    if (d.on && n(d.only_here)) list("only", esc(tr("{size} finns bara på datorn", { size: cloudSize(d.only_here) })),
      (d.only_here_files || []).map((f) => `<div class="srow"><span>${esc(f.name)}</span><span class="small">${esc(cloudSize(f.size))}</span></div>`).join(""));
    // No deputy yet (the service said no, or has not answered): nothing is said that is not so.
    if (d.on && !d.deputy) line(esc(tr(d.invite === 429 ? "Du är inbjuden, men molnet tar inte in fler just nu. Datorn frågar igen av sig själv."
      : d.invite ? "Molnet behöver en inbjudan: en vän som redan har molnet. Datorn frågar igen av sig själv."
      : d.error ? "Molnet kunde inte göras än; försöker igen." : "Molnet görs.")));
    if (d.on && d.deputy && d.until) line(esc(tr("Vänner ser din mapp till {date}", { date: cloudDay(d.until) })));
    if (d.on && n(d.old_friends)) line(esc(tr(n(d.old_friends) === 1 ? "1 vän har en äldre DAP-Share och ser inget när datorn är av" : "{n} vänner har en äldre DAP-Share och ser inget när datorn är av", { n: n(d.old_friends) })));
    if (n(d.waiting)) line(esc(tr(n(d.waiting) === 1 ? "1 ändring på väg till molnet" : "{n} ändringar på väg till molnet", { n: n(d.waiting) })));
    if (d.on && d.full) line(esc(tr("Molnet är fullt. Det som inte får plats finns bara på datorn.")));
    if (d.on && typeof d.clock_off === "number") line(esc(tr("Datorns klocka skiljer sig från molnets med {m} min. Inget stoppas; kontrollera tiden i Systeminställningar.", { m: Math.max(1, Math.round(Math.abs(d.clock_off) / 60)) })));
    if (d.clock_ahead_until) line(esc(tr("Datorns klocka gick fel; vännerna tar emot igen {date}.", { date: cloudDay(d.clock_ahead_until) })));
    if (d.on && d.other_install) lines.push(`<div class="srow cloudLine"><span>${esc(tr("DAP-Share används nu på en annan dator med samma nyckel."))}</span><button data-cloud-again="1">${esc(tr("Använd den här igen"))}</button></div>`);
    if (d.removal) {
      line(esc(tr("Telefonen är borttagen här och i molnet. {a} av {b} vänner vet det; de andra litar på den till {date}.", { a: n(d.removal.known), b: n(d.removal.friends), date: cloudDay(d.removal.until) })));
      lines.push(`<button class="quiet full" data-cloud-reseal="1">${esc(tr("Försegla allt igen (cirka {m} min)", { m: Math.max(1, n(d.reseal_minutes)) }))}</button>`);
    }
    if (n(d.removed_changes)) list("removed", esc(tr(n(d.removed_changes) === 1 ? "1 ändring från en borttagen telefon" : "{n} ändringar från en borttagen telefon", { n: n(d.removed_changes) })),
      (d.removed_items || []).map((c) => `<div class="srow"><span>${esc(or(c.name, ""))}</span><span><button class="quiet tiny" data-cloud-keep="${esc(c.id)}" data-keep="1">${esc(tr("Behåll"))}</button> <button class="quiet tiny" data-cloud-keep="${esc(c.id)}" data-keep="0">${esc(tr("Ångra"))}</button></span></div>`).join(""));
    if (n(d.dropped)) list("dropped", esc(tr("Borttaget i molnet de senaste 7 dagarna: {n}", { n: n(d.dropped) })),
      (d.dropped_items || []).map((x) => `<div class="srow"><span class="small">${esc(cloudSize(n(x.bytes)))} · ${esc(cloudDay(x.at))}</span><button class="quiet tiny" data-cloud-undrop="${esc(x.slot)}">${esc(tr("Ta tillbaka"))}</button></div>`).join(""));
    if (d.dropped_early) line(esc(tr("Det äldsta borttagna raderades tidigare, för att platsen tog slut.")));
    if (d.on && d.deputy && d.remade) line(esc(tr("Molnet hade raderats efter 180 dagar utan kontakt. Ett nytt är gjort och allt skickas igen.")));
    if (!d.relay_has) line(esc(tr("Den här reläservern har inget moln.")));
    setHtml($("cloudLines"), lines.join(""));
  }

  // ---- The inbox and the journal as one table (docs/SCREEN.md §7): what came in with its report, what went out today ----
  function renderJournal() {
    const friendIds = {}; state.contacts.forEach((c) => { if (c.lane === "friend") friendIds[c.dap_id] = true; });
    const jrows = state.journal || [];
    const rows = [];
    state.inbox.forEach((d) => {
      if (d.status === "discarded") return;
      const j = jrows.filter((x) => x.time === d.received_at && x.dap_id === d.sender.dap_id)[0] || {};
      const straight = d.released_by === "standing_yes" || j.by === "standing_yes";
      const words = [].concat(or(d.report.findings, []), or(d.report.notes, [])).map((x) => esc(trServer(x))).join("<br>");
      const status = d.status === "held" ? tr("väntar") : d.status === "released" ? (straight ? tr("gick rakt in") : tr("i hubben ({f})", { f: d.released_to })) : d.status;
      rows.push({ time: d.received_at, colour: d.report.colour, file: d.item.filename, who: or(d.sender.display_name, d.sender.dap_id), what: esc(trServer(d.report.what)) + (words ? "<br>" + words : ""),
        status: status + (j.paused ? " · " + tr("pausade det gröna flödet") : ""), kind: "received", friend: d.lane === "friend", straight });
    });
    ((state.today && state.today.lines) || []).forEach((l) => {
      if (l.kind !== "picked" && l.kind !== "out") return;
      rows.push({ time: l.time, colour: "", file: or(l.filename, ""), who: or(l.display_name, l.dap_id), what: esc(tr(l.kind === "picked" ? "vald av din agent" : "delning ute")), status: "", kind: "sent", friend: !!friendIds[l.dap_id], straight: false });
    });
    // What waits to reach a friend whose computer is off, and what did not arrive before its share ended (docs/CLOUD.md §7).
    (state.left || []).forEach((l) => {
      if (l.status !== "waiting" && l.status !== "not_arrived") return;
      rows.push({ time: l.time, colour: "", file: or(l.filename, ""), who: or(l.display_name, l.dap_id), what: esc(tr("delning ute")),
        status: l.status === "waiting" ? tr("Väntar på att nå {name}", { name: or(l.display_name, l.dap_id) }) : tr("Kom inte fram innan det tog slut"), kind: "sent", friend: !!friendIds[l.dap_id], straight: false });
    });
    rows.sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0));
    const f = journalFilter;
    const shown = rows.filter((r) => f === "all" || (f === "received" && r.kind === "received") || (f === "sent" && r.kind === "sent") || (f === "friends" && r.friend) || (f === "straight_in" && r.straight)).slice(0, 50);
    [].forEach.call(document.querySelectorAll("#journalFilter button"), (b) => { b.className = "quiet" + (b.getAttribute("data-filter") === f ? " on" : ""); });
    setHtml($("inbox"), shown.map((r) => `<tr><td>${r.colour ? `<span class="dot ${esc(r.colour)}"></span>` : ""}</td><td class="small">${esc(when(r.time))}</td><td>${esc(r.file)}</td><td>${esc(r.who)}</td><td class="small">${r.what}</td><td class="small">${esc(r.status)}</td></tr>`).join("") || '<tr><td colspan="6" class="empty">' + esc(tr("Tomt.")) + "</td></tr>");
  }

  // The state is asked for and the whole screen drawn from it. With `stale` the screen is drawn
  // again from the state already here (a press that changes only the screen), without asking the agent.
  async function refresh(stale) {
    if (!stale) {
      const at = Date.now();
      let now;
      try { now = await api("GET", "state"); } catch { return; }
      if (!now || !now.me) return; // not an answer about the agent (a refusal, or a line that is not up yet)
      state = now;
      stateAsked = at;
    }
    if (!state) return;
    const asked = stateAsked;
    // The owner's phone as a remote: the agent says so (me.remote). What a remote may not do
    // (docs/REMOTE.md §4) is not offered there, and where one is stays in view.
    const far = !!state.me.remote;
    $("remoteHere").hidden = !far;
    $("remoteNote").hidden = !far;
    if (far) {
      $("remoteHere").textContent = tr("Från din telefon");
      $("remoteNoteText").textContent = tr("Det här är din telefon som fjärrkontroll för {name}. Inställningarna ändrar du på datorn: AI-agenten, det du gillar, vem som hittar dig, vad dina vänner ser, telefonerna och att stänga av.", { name: state.me.display_name });
    }
    renderRemote(far ? undefined : state.me.remote_control, asked);
    $("who").textContent = state.me.display_name;
    $("myId").textContent = state.me.dap_id;
    $("openFolderBtn").disabled = !state.me.can_open_folder;
    // The three folders (docs/SCREEN.md §1): a button only where this screen can open that folder. On
    // the computer's own screen and a lan screen: where the state names the folder and the computer
    // can show it. On a remote: where the page around the screen has its own way and the state names
    // the folder (an agent started without a library has none to look in). Otherwise (the Node
    // agent, which opens no folders) none, and then the bar is not there either.
    const opens = far ? { share: !!(FOLDER && state.me.folder), received: !!(FOLDER && state.me.received), library: !!(FOLDER && state.me.library) }
      : { share: !!(state.me.folder && state.me.can_open_folder), received: !!(state.me.received && state.me.can_open), library: !!(state.me.library && state.me.can_open) };
    [].forEach.call(document.querySelectorAll("#folderBar button"), (b) => { b.hidden = !opens[b.getAttribute("data-folder")]; });
    $("folderBar").hidden = !(opens.share || opens.received || opens.library);
    $("quitBtn").hidden = !state.me.can_quit;
    $("quitRow").hidden = far;
    // The two settings of the computer itself: only the computer's own screen is told of them
    // (me.computer), and each is shown only where it can work.
    const comp = far ? undefined : state.me.computer;
    const awake = comp && comp.keep_awake, login = comp && comp.start_at_login;
    $("awakeRow").hidden = !(awake && awake.available);
    if (awake) {
      $("awakeBadge").textContent = tr(awake.on ? "på" : "av");
      $("awakeBadge").className = "badge" + (awake.on ? "" : " off");
      $("awakeBtn").textContent = tr(awake.on ? "Stäng av" : "Slå på");
    }
    $("loginRow").hidden = !(login && (login.available || login.translocated || login.on));
    if (login) {
      $("loginBadge").textContent = tr(login.on ? "på" : "av");
      $("loginBadge").className = "badge" + (login.on ? "" : " off");
      $("loginBtn").textContent = tr(login.on ? "Stäng av" : "Slå på");
      $("loginBtn").hidden = !(login.available || login.on);  // what is on can always be turned off
      $("loginWhy").textContent = tr(!login.available && login.on ? "En äldre plats öppnas fortfarande när du loggar in. Stäng av här. Slå sedan på igen från appen där den ligger nu, om du vill."
        : !login.available ? "Går inte att slå på härifrån: macOS kör appen från en tillfällig plats. Dra DAP-Share till Program i Finder och öppna den därifrån."
        : login.elsewhere ? "Den pekar på en plats där appen inte ligger nu, så DAP-Share startar inte vid inloggning. Stäng av och slå på igen."
        : "Gäller från nästa gång du loggar in. Den startar tyst, utan att öppna skärmen. Den pekar på där appen ligger nu: flyttar du appen, stäng av och slå på igen.");
    }
    $("interestsCard").hidden = state.me.interests === undefined; // an agent that keeps no card (the Node agent) shows none
    if (state.me.interests !== undefined && (far || (document.activeElement !== $("interestsIn") && !$("interestsIn").dataset.dirty))) $("interestsIn").value = state.me.interests || "";
    $("interestsIn").readOnly = far; // the owner's card is one of the settings: shown on a remote, changed on the computer
    $("interestsBtn").hidden = far;
    $("interestsHint").textContent = far ? tr("Det här ändrar du på datorn.") : "";
    $("libraryHint").textContent = state.me.library ? tr("Lägg här det du gärna ger bort. Din AI-agent väljer härifrån åt dina vänner: {p}", { p: state.me.library.split(/[\\/]/).slice(-2).join("/") }) : "";
    $("libraryBtn").hidden = !state.me.library;
    $("libraryBtn").disabled = !(state.me.can_open && state.me.library);
    $("receivedBtn").disabled = !(state.me.can_open && state.me.received);
    if (state.me.received) { $("receivedHint").textContent = state.me.received.split(/[\\/]/).slice(-2).join("/"); $("receivedHint").title = state.me.received; }
    $("me").textContent = tr("på det här nätverket: {a}", { a: state.me.endpoint.host + ":" + state.me.endpoint.port });
    $("relayBadge").textContent = tr(state.me.relay ? (state.me.relay_status === "registered" ? "online" : "ansluter …") : "bara det här nätverket");
    $("relayBadge").title = state.me.relay ? state.me.relay.relay.host + ":" + state.me.relay.relay.port + " (" + state.me.relay_status + ")" : tr("inget relä: möten över internet går inte");
    $("relayBadge").className = "badge" + (state.me.relay_status === "registered" ? "" : " off");
    // The owner's own relay is the likely one for a meeting too: fill it in once, so only the other's id is left to type.
    if (state.me.relay && !relayFilled) { relayFilled = true; if (!$("relayIn").value) $("relayIn").value = state.me.relay.relay.host + ":" + state.me.relay.relay.port; }
    $("mdnsBadge").textContent = tr(state.me.discovery ? "syns på nätverket" : "syns inte på nätverket");
    $("mdnsBadge").title = tr(state.me.discovery ? "mDNS: andra agenter på samma nätverk ser den här" : "mDNS: andra agenter på samma nätverk ser inte den här");
    $("mdnsBadge").className = "badge" + (state.me.discovery ? "" : " off");
    $("codeWhy").textContent = tr(far ? "Koden är datorns adress. Den andra skannar den, och mötet går genom reläet." : "Den andra personen skannar koden i rummet. Den gäller en gång, i fem minuter, och bevisar att ni verkligen träffades.");
    // ---- being found (the directory on the relay) and friends seeing the share folder: each asked
    // once, on the computer, and changed under Settings. An agent that does not have them (the Node
    // agent) says nothing about them, and nothing is shown. ----
    const dir = state.me.directory;
    const mayList = !!(dir && dir.available);
    $("findCard").hidden = !dir;
    const askList = mayList && dir.listed === null && !far; // on a remote the two questions are not asked: they are answered on the computer
    $("listAsk").innerHTML = askList ? questionList() : "";
    if (dir) {
      $("findHint").innerHTML = esc(tr(mayList ? "Sök bland dem som valt att synas. Skicka en vänförfrågan; när den andra säger ja ser ni varandras delningsmappar." : "Katalogen finns inte på det här reläet än. Du kan fortfarande lägga till en vän med en kod eller när ni möts.")) + ` <a href="${esc(PRIVACY)}" target="_blank" rel="noopener">${esc(tr("Vad som visas och sparas"))}</a>`;
      $("listedRow").hidden = !mayList;
      $("findIn").disabled = $("findBtn").disabled = !mayList;
      $("listedBadge").textContent = tr(dir.listed ? (dir.listed_now ? "ja, som {name}" : "ja, ansluter …") : "nej", { name: state.me.display_name });
      $("listedBadge").className = "badge" + (dir.listed ? "" : " off");
      $("listedBtn").textContent = tr(dir.listed ? "Sluta synas" : "Bli synlig");
      $("listedBtn").dataset.listed = dir.listed ? "no" : "yes";
      $("listedBtn").hidden = far;
    }
    const friendIds = {}; state.contacts.forEach((c) => { friendIds[c.dap_id] = true; });
    const askedIds = {}; (state.asked || []).forEach((a) => { askedIds[a] = true; });
    const askingIds = {}; state.friend_requests.forEach((r) => { askingIds[r.dap_id] = true; });
    setHtml($("found"), found === null ? "" : found.entries.length
      ? found.entries.map((p) => `<div class="meeting"><div><b>${esc(p.display_name)}</b><div class="mono">${esc(p.dap_id)}</div></div><div>${
          (state.blocked || []).some((b) => b.dap_id === p.dap_id) ? esc(tr("blockerad"))
          : friendIds[p.dap_id] ? esc(tr("vän"))
          : askingIds[p.dap_id] ? `<button data-accept="${esc(p.dap_id)}">${esc(tr("Acceptera"))}</button>`
          : askedIds[p.dap_id] ? esc(tr("frågad, väntar på svar"))
          : `<button data-ask="${esc(p.dap_id)}" data-ask-name="${esc(p.display_name)}">${esc(tr("Bli vänner"))}</button>`}</div></div>`).join("") + (found.total > found.entries.length ? `<div class="small">${esc(tr("Visar {a} av {b}. Sök på ett namn för att hitta fler.", { a: found.entries.length, b: found.total }))}</div>` : "")
      : `<div class="empty">${esc(tr("Ingen hittades."))}</div>`);
    const live = state.me.live_folder;
    const askLive = live === null && !far;
    $("liveAsk").innerHTML = askLive ? questionLive() : "";
    $("firstStart").hidden = !(askList || askLive);
    $("liveRow").hidden = live === undefined;
    $("liveBadge").textContent = live ? tr(state.me.live_files === 1 ? "på: {n} fil" : "på: {n} filer", { n: state.me.live_files }) : tr("av");
    $("liveBadge").className = "badge" + (live ? "" : " off");
    $("liveBtn").textContent = tr(live ? "Stäng av" : "Slå på");
    $("liveBtn").dataset.live = live ? "no" : "yes";
    $("liveBtn").hidden = far;

    // ---- the AI agent (the advisor): a model that may look, propose or share inside the owner's rules; never more ----
    const adv = state.advisor;
    $("advisorPanel").hidden = !adv;
    if (adv) {
      const aud = AUD();
      $("advisorHint").textContent = adv.off
        ? tr("Avstängd. Ingen AI-agent kommer åt DAP-Share.")
        : tr("En modell kan tala med agenten ({level}). Den når aldrig knappen, slussen, vännerna eller innehållet.", { level: LEVEL()[adv.level] }) + (adv.level === 2 && adv.rules ? tr(" Regler: {aud}, högst {h} h, högst {f} filer åt gången", { aud: adv.rules.audiences.map((a) => or(aud[a], a)).join(", "), h: adv.rules.max_hours, f: adv.rules.max_files }) + (adv.rules.kinds ? tr(", bara {x}", { x: adv.rules.kinds.join(", ") }) : "") + (adv.rules.files ? tr(", bara {x}", { x: adv.rules.files.join(", ") }) : "") + "." : "");
      // The level can be chosen here when the agent lets the screen choose it (the Python agent and the Mac app).
      $("levelRow").hidden = !adv.connect || far;
      $("readLibRow").hidden = !adv.connect || far;
      if (adv.connect && document.activeElement !== $("readLibIn")) $("readLibIn").checked = adv.read_library !== false;
      if (adv.connect && document.activeElement !== $("levelIn")) $("levelIn").value = adv.off ? "off" : String(adv.level);
      $("connectBox").hidden = !adv.connect || !!adv.off || far;
      if (adv.connect && !far) {
        const c = adv.connect;
        $("claudeCfg").textContent = JSON.stringify({ mcpServers: { "dap-share": { command: c.command, args: c.args } } }, null, 2);
        const toml = (v) => JSON.stringify(v); // a TOML basic string is written like a JSON string
        $("codexCfg").textContent = "[mcp_servers.dap-share]\ncommand = " + toml(c.command) + "\nargs = [" + c.args.map(toml).join(", ") + "]\n";
      }
      const decided = adv.proposals.filter((p) => p.status !== "pending").slice(-5).reverse();
      const STATUS = { accepted: tr("du sa ja"), declined: tr("du sa nej"), withdrawn: tr("togs tillbaka") };
      $("proposalsHead").hidden = !decided.length;
      $("proposals").innerHTML = decided.length ? `<div class="small">${decided.map((p) => `${when(or(p.decided_at, p.at))} ${p.files.map(esc).join(", ")} → ${or(STATUS[p.status], esc(p.status))}`).join("<br>")}</div>` : "";
    }
    const w = waitingNow();
    renderHome(far, w);
    renderWaiting(far, w, (askList ? questionList() : "") + (askLive ? questionLive() : ""));
    renderFriends(far, w);
    renderPerson(far);
    renderShare();
    renderSettings(far);
    renderJournal();
  }

  // ---- the share folder: what is in it, and what the owner chooses to offer ----
  const KIND_NAMES = { DOCUMENT: tr("dokument"), IMAGE: tr("bild"), VIDEO: tr("video"), AUDIO: tr("ljud"), ARCHIVE: tr("arkiv"), CONTACT_CARD: tr("kontaktkort"), LINK: tr("länk") };
  let folderFiles = [];
  async function folder() {
    try {
      const r = await api("GET", "folder");
      if (!r || r.files === undefined) return; // not an answer about the folder
      folderSeen = true;
      $("sharePanel").hidden = !r.folder;
      $("goSend").hidden = !r.folder; // an agent without a share folder has nothing to send from
      $("openFolderBtn").hidden = !r.folder;
      if (!r.folder) return;
      $("openFolderBtn").disabled = !(state && state.me.can_open_folder);
      $("folderHint").textContent = r.folder.split(/[\\/]/).slice(-2).join("/");
      $("folderHint").title = r.folder;
      const checked = new Set([...document.querySelectorAll("#folder input:checked")].map((i) => i.value));
      folderFiles = r.files;
      $("folder").innerHTML = r.files.map((f) => `<tr><td><input type="checkbox" value="${esc(f.filename)}" ${f.shareable ? "" : "disabled"} ${checked.has(f.filename) ? "checked" : ""}></td><td>${esc(f.filename)}</td><td class="small">${[KIND_NAMES[f.kind], trServer(f.label), kb(f.size_bytes)].filter(Boolean).map(esc).join(" · ")}</td><td class="small">${f.shareable ? "" : esc(tr("delas inte: ") + trServer(f.reason))}</td></tr>`).join("") || '<tr><td class="empty">' + esc(tr("Mappen är tom.")) + "</td></tr>";
    } catch {}
  }
  // The cloud's switch and its red last button (docs/CLOUD.md §9.6, §9.2, §9.3): the computer's own screen only.
  $("cloudOnBtn").onclick = async () => {
    const r = await post("deputy/on");
    if (!(r && r.ok)) toast(tr("Gick inte: ") + trServer(r && r.error));
    refresh(true);
  };
  $("cloudOffBtn").onclick = async () => {
    if (!confirm(tr("Det som ligger i molnet raderas. Slår du på igen skickas allt på nytt."))) return;
    const r = await post("deputy/off");
    if (!(r && r.ok)) toast(tr("Gick inte: ") + trServer(r && r.error));
    refresh(true);
  };
  $("quitBtn").onclick = async () => {
    if (!confirm(tr("Stäng av DAP-Share? Ingen kan nå dig förrän du öppnar appen igen."))) return;
    try { await post("quit"); } catch (e) {}
    document.body.innerHTML = '<div class="container"><h1>' + esc(tr("DAP-Share är avstängd")) + '</h1><p class="small">' + esc(tr("Öppna appen igen när du vill dela eller ta emot. Det du redan släppt in ligger kvar i din mapp.")) + "</p></div>";
  };
  async function find() {
    $("findBtn").disabled = true;
    try {
      const r = await post("find", { query: $("findIn").value.trim() });
      if (r.error) { found = null; toast(tr("Gick inte: ") + trServer(r.error)); } else found = r;
    } finally { $("findBtn").disabled = false; refresh(); }
  }
  $("findBtn").onclick = find;
  $("findIn").onkeydown = (e) => { if (e.key === "Enter") find(); };
  $("libraryBtn").onclick = async () => { const r = await post("library/open"); if (!r.ok) toast(tr("Mappen gick inte att öppna")); };
  $("receivedBtn").onclick = async () => { const r = await post("received/open"); if (!r.ok) toast(tr("Mappen gick inte att öppna")); };
  $("openFolderBtn").onclick = async () => { const r = await post("folder/open"); if (!r.ok) toast(tr("Mappen gick inte att öppna")); };
  // The same three from the bar at the top (docs/SCREEN.md §1). On the owner's phone the page around
  // the screen shows the folder its own way, and the agent is asked nothing. That way is not this
  // screen's code: what it throws, or a promise of it that fails, is said as a folder that did not open.
  const FOLDER_OPEN = { share: "folder/open", received: "received/open", library: "library/open" };
  async function openFolder(place) {
    if (!FOLDER_OPEN[place] || !state) return;
    if (state.me.remote) {
      try { if (FOLDER) await FOLDER(place); } catch (e) { toast(tr("Mappen gick inte att öppna")); }
      return;
    }
    const r = await post(FOLDER_OPEN[place]);
    if (!r.ok) toast(tr("Mappen gick inte att öppna"));
  }
  // The sheet under the owner's name: the address, as text and as a code, the relay, the agent, the version.
  $("who").onclick = () => { meOpen = !meOpen; $("meSheet").hidden = !meOpen; };
  $("idQrBtn").onclick = () => { if (!state) return; drawQr(state.me.dap_id, $("idQr")); $("idQrBox").hidden = false; };
  // Only the field the chosen audience needs is shown.
  function audienceFields() {
    const a = $("audienceIn").value;
    $("shareCodeIn").hidden = a !== "ANYONE_WITH_CODE";
    $("codeRow").hidden = a !== "ANYONE_WITH_CODE";
    $("listedIn").hidden = a !== "LISTED";
  }
  $("audienceIn").onchange = audienceFields;
  audienceFields();
  $("shareBtn").onclick = async () => {
    const files = [...document.querySelectorAll("#folder input:checked")].map((i) => i.value);
    if (!files.length) return toast(tr("Bocka för minst en fil"));
    const body = { files, audience: $("audienceIn").value, hours: Number($("hoursIn").value) || 24 };
    if ($("shareCtxIn").value.trim()) body.context = $("shareCtxIn").value.trim();
    if (body.audience === "ANYONE_WITH_CODE" && $("shareCodeIn").value) body.code = $("shareCodeIn").value;
    if (body.audience === "LISTED" && $("listedIn").value.trim()) body.listed = $("listedIn").value.split(",").map((s) => s.trim()).filter(Boolean);
    const r = await post("policy", body);
    if (r.error) return toast(tr("Gick inte att dela: ") + r.error);
    toast(tr(r.policy.items.length === 1 ? "Delar {n} fil" : "Delar {n} filer", { n: r.policy.items.length }) + (r.skipped.length ? tr(", hoppade över {n}", { n: r.skipped.length }) : ""));
    lastCode = body.audience === "ANYONE_WITH_CODE" ? body.code : null;
    $("shareCodeIn").value = "";
    [].forEach.call(document.querySelectorAll("#folder input:checked"), (i) => { i.checked = false; });
    await refresh();
    setStep(3);
  };

  // ---- the views (docs/SCREEN.md §1): four reached with the icons, the places under them one tap away ----
  const PARENT = { waiting: "home", person: "friends", meet: "friends", send: "share", receive: "share", advisor: "settings", likes: "settings", allow: "settings", phone: "settings", connect: "settings", computer: "settings", cloud: "settings", journal: "settings", about: "settings" };
  const VIEWS = ["home", "waiting", "friends", "person", "meet", "share", "send", "receive", "settings", "advisor", "likes", "allow", "phone", "connect", "computer", "cloud", "journal", "about"];
  let view = "home";
  let step = 1;
  function setStep(n) {
    step = n;
    [].forEach.call(document.querySelectorAll(".step"), (el) => { el.hidden = Number(el.getAttribute("data-step")) !== n; });
    [].forEach.call(document.querySelectorAll("#stepper li"), (li) => { const k = Number(li.getAttribute("data-s")); li.className = k === n ? "on" : k < n ? "done" : ""; });
    if (n === 2) {
      const files = [].map.call(document.querySelectorAll("#folder input:checked"), (i) => i.value);
      $("chosen").textContent = tr(files.length === 1 ? "{n} fil: {names}" : "{n} filer: {names}", { n: files.length, names: files.join(", ") });
      if (!$("shareCodeIn").value) $("shareCodeIn").value = newCode();
    }
  }
  // Discard with five seconds of undo (docs/SCREEN.md §3): nothing is posted before the five seconds
  // are over, or before the owner leaves the view. Undo within them posts nothing. A page closed
  // before the post leaves the file held, which is the safe side.
  function discardLater(id) {
    if (discarding[id]) return;
    discarding[id] = setTimeout(() => discardNow(id), 5000);
  }
  function discardNow(id) {
    if (!discarding[id]) return;
    clearTimeout(discarding[id]);
    delete discarding[id];
    post("discard", { delivery_id: id }).then((r) => { if (!(r && r.ok)) toast(tr("Gick inte att kasta: filen var inte längre förseglad")); return refresh(); }, () => {});
  }
  function flushDiscards() { Object.keys(discarding).forEach(discardNow); }
  function go(to) {
    if (VIEWS.indexOf(to) < 0) to = "home";
    if (to === "person" && !personOpen) to = "friends";
    if (view === "waiting" && to !== "waiting") flushDiscards();
    view = to;
    [].forEach.call(document.querySelectorAll(".view"), (el) => { el.hidden = el.getAttribute("data-view") !== to; });
    const top = or(PARENT[to], to);
    [].forEach.call(document.querySelectorAll("#tabs button"), (b) => { b.classList.toggle("on", b.getAttribute("data-go") === top); });
    $("backBtn").hidden = PARENT[to] === undefined; // not on the four views themselves, where the icons already lead (docs/SCREEN.md §1)
    $("backBtn").dataset.go = or(PARENT[to], "home"); // back goes to the view the place belongs to
    if (to === "send") setStep(state && state.policies.length ? 3 : 1);
    if (to === "meet") { $("codeBody").hidden = false; $("codeFold").classList.add("open"); if ($("qrBox").hidden) $("tokenBtn").click(); } // the code is what this screen is for: show it at once
    if (TRANSPORT && (to === "meet" || to === "friends")) nearby();
    if (TRANSPORT && to === "send") folder();
    try { if (location.hash.slice(1) !== (to === "home" ? "" : to)) history.pushState(null, "", to === "home" ? location.pathname + location.search : "#" + to); } catch (e) {}
    window.scrollTo(0, 0);
    if (state) refresh();
  }
  function openPerson(dap_id) {
    personOpen = dap_id;
    shelfOpen = dap_id;
    go("person");
  }
  window.addEventListener("popstate", () => go(location.hash.slice(1) || "home"));
  $("toStep2").onclick = () => {
    if (!document.querySelectorAll("#folder input:checked").length) return toast(tr("Bocka för minst en fil"));
    setStep(2);
  };
  // A code nobody has to invent: two words and four digits, from the browser's own randomness.
  const CODE_A = "amber azure bold brave bright calm clever cosmic crisp dapper eager early fancy fresh gentle glad golden green happy humble jolly keen kind lively lucky mellow merry mighty neat noble proud quick quiet rapid royal shiny silver smart snowy solar steady sunny swift tidy vivid warm wild wise young zesty".split(" ");
  const CODE_B = "otter falcon maple river comet badger cedar dolphin ember finch garnet harbor iris jaguar koala lantern meadow nectar orchid panda quartz raven saffron tiger umber violet walnut yarrow zebra alpaca birch coral dune eagle fjord glacier heron island juniper kestrel lotus mango narwhal oak pebble robin spruce thistle willow".split(" ");
  function newCode() {
    const r = new Uint32Array(3);
    (window.crypto || window.msCrypto).getRandomValues(r);
    return CODE_A[r[0] % CODE_A.length] + "-" + CODE_B[r[1] % CODE_B.length] + "-" + String(1000 + (r[2] % 9000));
  }
  $("newCodeBtn").onclick = () => { $("shareCodeIn").value = newCode(); };

  // ---- telling the other person: the owner's own WhatsApp, Telegram, mail or Messages opens with the text
  // written; the owner picks who gets it and presses send. DAP-Share itself sends nothing and keeps no contacts.
  // ?invite: messengers keep a link's card for a long time, so a new card goes with a new link.
  const LANDING = "https://dapshare.app/?invite";
  const PRIVACY = "https://dapshare.app/privacy.html";
  $("privacyLink").href = PRIVACY;
  let lastCode = null; // the code of the last share, in this page only: the agent never shows a code back
  // The link goes first: WhatsApp, Telegram and iMessage show the first link's card (the logo and
  // the line under it, from the landing page's Open Graph tags) above the text.
  function inviteText(linkShownApart) {
    const coded = state.policies.some((p) => p.audience === "ANYONE_WITH_CODE");
    const lines = linkShownApart ? [] : [LANDING, ""];
    // Numbered as they come: the code step is there only when the share has a code.
    const steps = [
      tr("Hämta appen från länken och dra den till Program."),
      // Not signed by Apple: the first double-click is refused, so say how to open it before it happens.
      tr("Första gången: högerklicka på appen och välj Öppna."),
      tr("Klistra in min adress under Ta emot: {addr}", { addr: state.me.dap_id }),
    ];
    if (coded) steps.push(lastCode ? tr("Koden: {code}", { code: lastCode }) : tr("Koden får du av mig separat."));
    steps.push(tr("Tryck Hämta."));
    lines.push(tr("Från min agent till din: filer väntar på dig."));
    steps.forEach((t, i) => lines.push(i + 1 + ". " + t));
    return lines.join("\n");
  }
  function openLink(url) {
    const a = document.createElement("a");
    a.href = url;
    if (/^https:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; }
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  function sendInvite(how) {
    if (!state) return;
    const text = inviteText();
    const enc = encodeURIComponent;
    if (how === "whatsapp") openLink("https://wa.me/?text=" + enc(text));
    else if (how === "telegram") openLink("https://t.me/share/url?url=" + enc(LANDING) + "&text=" + enc(inviteText(true))); // Telegram puts the link above the text itself
    else if (how === "email") openLink("mailto:?subject=" + enc(tr("Filer till dig via DAP-Share")) + "&body=" + enc(text));
    else if (how === "sms") openLink("sms:&body=" + enc(text));
    else copyText(text).then((ok) => toast(tr(ok ? "Meddelandet är kopierat" : "Markera och kopiera själv")));
  }

  document.addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) {
      // A row in Waiting, tapped beside its buttons: the review's words (or Block) open under it.
      const row = e.target.closest ? e.target.closest("[data-item]") : null;
      if (row) { const id = row.getAttribute("data-item"); if (expanded[id]) delete expanded[id]; else expanded[id] = true; refresh(true); }
      return;
    }
    const d = b.dataset;
    if (d.send) return sendInvite(d.send);
    if (d.go) return go(d.go);
    if (d.folder) return openFolder(d.folder);
    if (d.stepGo) return setStep(Number(d.stepGo));
    if (d.fold) { const body = $(d.fold); body.hidden = !body.hidden; b.classList.toggle("open", !body.hidden); return; }
    if (d.cloudList) { cloudOpen[d.cloudList] = !cloudOpen[d.cloudList]; return refresh(true); }
    if (d.cloudAgain) { const r = await post("deputy/again"); if (!(r && r.ok)) toast(tr("Gick inte: ") + trServer(r && r.error)); }
    else if (d.cloudReseal) { const r = await post("deputy/reseal"); if (!(r && r.ok)) toast(tr("Gick inte: ") + trServer(r && r.error)); }
    else if (d.cloudUndrop) { const r = await post("deputy/undrop", { slots: [d.cloudUndrop] }); if (!(r && r.ok)) toast(tr("Gick inte: ") + trServer(r && r.error)); }
    else if (d.cloudKeep) { const r = await post("deputy/keep", { id: d.cloudKeep, keep: d.keep === "1" }); if (!(r && r.ok)) toast(tr("Gick inte: ") + trServer(r && r.error)); }
    if (d.cloudAgain || d.cloudReseal || d.cloudUndrop || d.cloudKeep) return refresh(true);
    if (d.filter) { journalFilter = d.filter; return refresh(true); }
    if (d.journal) { journalFilter = d.journal; return go("journal"); }
    if (d.person) return openPerson(d.person);
    if (d.copy) return copyText(d.copy).then((ok) => toast(tr(ok ? "Adressen är kopierad" : "Markera adressen och kopiera den själv")));
    if (d.undo) { clearTimeout(discarding[d.undo]); delete discarding[d.undo]; return refresh(true); }
    if (d.discard) { discardLater(d.discard); return refresh(true); }
    if (d.release) { await post("release", { delivery_id: d.release }); toast(tr("Insläppt i hubben")); }
    else if (d.greenAll) {
      // Up to ten the green ones go in with this press, each by its own id: exactly the files the bar
      // counted, never one the owner threw away whose discard is still on its way. Above ten the
      // owner sees the list first.
      if (Number(d.greenAll) > 10) return go("waiting");
      const w = waitingNow();
      let a = 0;
      for (let i = 0; i < w.green.length; i++) {
        const r = await post("release", { delivery_id: w.green[i].id });
        if (r && r.ok) a++;
      }
      toast(tr("{a} släpptes in, {b} väntar", { a, b: w.held.length - a }));
    }
    else if (d.accept) { await post("friends", { dap_id: d.accept }); toast(tr("Vän tillagd")); }
    else if (d.decline) { await post("friends/decline", { dap_id: d.decline }); }
    else if (d.block) {
      if (!confirm(tr("Blockera {name}? De får inget från dig, och deras förfrågningar visas inte. De får inte veta det.", { name: d.blockName || d.block }))) return;
      const r = await post("friends/block", { dap_id: d.block, display_name: d.blockName });
      if (r.error) toast(tr("Gick inte: ") + r.error); else { toast(tr("Blockerad")); if (shelfOpen === d.block) shelfOpen = null; if (personOpen === d.block) { personOpen = null; if (view === "person") go("friends"); } }
    }
    else if (d.unblock) { await post("friends/unblock", { dap_id: d.unblock }); toast(tr("Blockeringen är hävd")); }
    else if (d.demote) { await post("friends/demote", { dap_id: d.demote }); }
    else if (d.remove) { await post("friends/remove", { dap_id: d.remove }); if (personOpen === d.remove) { personOpen = null; if (view === "person") go("friends"); } }
    else if (d.befriend) { await post("friends", { dap_id: d.befriend }); toast(tr("Vän tillagd")); }
    else if (d.listed) { await post("listed", { on: d.listed === "yes" }); toast(tr(d.listed === "yes" ? "Nu kan andra hitta dig" : "Du syns inte i katalogen")); }
    else if (d.ask) {
      busy(tr("skickar vänförfrågan …"));
      try {
        // The directory's name goes with the ask, so the row "Frågad · väntar på svar" can carry it (docs/SCREEN.md §5.1, §8.1).
        const r = await post("friends/ask", { dap_id: d.ask, display_name: d.askName || null });
        if (r.error) toast(tr("Gick inte: ") + r.error);
        else toast(tr(r.friend_request === "accepted" ? "Ni är vänner nu" : r.later ? "Förfrågan skickas när de är online" : "Vänförfrågan skickad"));
      } finally { busy(null); }
    }
    else if (d.unask) { const r = await post("friends/unask", { dap_id: d.unask }); if (r && r.error) toast(tr("Gick inte: ") + trServer(r.error)); else toast(tr("Förfrågan är tillbakatagen")); }
    // The standing yes per friend (docs/SCREEN.md §4): on or off, and either answer clears the pause.
    else if (d.direction) { const r = await post("friends/direction", { dap_id: d.direction, receive_without_button: d.on === "1" }); if (r && r.error) toast(tr("Gick inte: ") + trServer(r.error)); }
    else if (d.removeFor) { const r = await post("policy/remove_for", { dap_id: d.removeFor }); toast(r && r.ok ? tr(r.removed === 1 ? "{n} delning stoppad" : "{n} delningar stoppade", { n: r.removed }) : tr("Gick inte: ") + trServer(r && r.error)); }
    else if (d.live) { await post("live", { on: d.live === "yes" }); toast(tr(d.live === "yes" ? "Dina vänner ser nu din delningsmapp" : "Dina vänner ser inte mappen")); }
    else if (d.browse) {
      busy(tr("tittar i mappen …"));
      try { const r = await post("browse", { dap_id: d.browse }); if (r.error) toast(tr("Gick inte: ") + r.error); else shelfOpen = d.browse; } finally { busy(null); }
    }
    else if (d.fetch || d.fetchAll) {
      busy(tr("hämtar …"));
      try {
        const r = await post("fetch", d.fetchAll ? { dap_id: shelfOpen } : { dap_id: shelfOpen, ids: [d.fetch] });
        if (r.error) toast(tr("Gick inte: ") + r.error);
        else {
          // A file the owner already has is skipped, and that is not a failure.
          const had = r.results.filter((x) => x.status === "skipped" && x.reason === "redan mottagen").length;
          const got = r.results.filter((x) => x.status === "released" || x.status === "held").length;
          const failed = r.results.length - got - had;
          toast(tr(got === 1 ? "Hämtade {n} fil" : "Hämtade {n} filer", { n: got }) + (had ? tr(", {n} hade du redan", { n: had }) : "") + (failed ? tr(", {n} gick inte", { n: failed }) : ""));
        }
      } finally { busy(null); }
    }
    else if (d.shelfClose) { shelfOpen = null; }
    else if (d.meetNearby) { const a = JSON.parse(d.meetNearby); await meet({ host: a.host, port: a.port, nearby: true }); }
    else if (d.unshare !== undefined) { const gone = await post("policy/remove", { index: Number(d.unshare), what: d.what }); toast(tr(gone && gone.ok ? "Delas inte längre" : "Den delningen fanns inte kvar")); }
    else if (d.acceptProposal) {
      const codeIn = document.querySelector(`[data-code-for="${d.acceptProposal}"]`);
      const r = await post("proposals/accept", { id: d.acceptProposal, code: (codeIn && codeIn.value) || undefined });
      toast(r.ok ? tr(r.policy.items.length === 1 ? "Delar {n} fil" : "Delar {n} filer", { n: r.policy.items.length }) + tr(" som rådgivaren föreslog") : tr("Gick inte: ") + r.reason);
    }
    else if (d.rejectProposal) { await post("proposals/reject", { id: d.rejectProposal }); toast(tr("Avböjt")); }
    else if (d.pairYes || d.pairNo) {
      // The owner's answer to the phone that asks. It names the pairing it was shown: an answer to one that no longer waits is an answer to nothing.
      const yes = !!d.pairYes;
      const r = await post("remote/answer", { id: d.pairYes || d.pairNo, yes });
      toast(r.error ? tr("Gick inte: ") + trServer(r.error) : !r.ok ? tr("Den frågan gäller inte längre") : tr(yes ? "Telefonen är ansluten" : "Telefonen släpptes inte in"));
    }
    else if (d.phoneRemove) { removeAsk = d.phoneRemove; } // the first press only asks
    else if (d.phoneRemoveNo) { removeAsk = null; }
    else if (d.phoneRemoveYes) {
      removeAsk = null;
      const r = await post("remote/remove", { dap_id: d.phoneRemoveYes });
      toast(r.error ? tr("Gick inte: ") + trServer(r.error) : tr(r.ok ? "Telefonen är borttagen" : "Telefonen var redan borttagen"));
    }
    else return;
    refresh();
  });

  // ---- the code to show: a real QR code, scanned in person by the other owner's app (§5) ----
  function drawQr(text, canvas) {
    const qr = qrcode(0, "M"); // type 0: smallest version that fits
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount(), cell = 6, quiet = 4;
    canvas.width = canvas.height = (n + quiet * 2) * cell;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
    return n;
  }
  // ---- the owner's address, to send to the other person ----
  function copyFallback(text) {
    const a = document.createElement("textarea");
    a.value = text; a.style.position = "fixed"; a.style.opacity = "0";
    document.body.appendChild(a); a.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(a);
    return ok;
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => copyFallback(text));
    return Promise.resolve(copyFallback(text));
  }
  $("copyClaudeBtn").onclick = () => copyText($("claudeCfg").textContent).then((ok) => toast(tr(ok ? "Kopierat. Klistra in i Claude Desktop." : "Markera raderna och kopiera dem själv")));
  $("copyCodexBtn").onclick = () => copyText($("codexCfg").textContent).then((ok) => toast(tr(ok ? "Kopierat. Klistra in i ~/.codex/config.toml." : "Markera raderna och kopiera dem själv")));
  // ---- Connect a phone: the agent makes a code that works once, for five minutes; it is drawn here and nowhere else ----
  $("remotePairBtn").onclick = async () => {
    const r = await post("remote/pair");
    if (!r.ok) return toast(tr("Gick inte: ") + trServer(r.error));
    drawQr(r.code, $("remoteCanvas"));
    remoteCode = { expires_at: r.expires_at, made: Date.now() };
    refresh();
  };
  $("remoteCancelBtn").onclick = async () => {
    remoteCode = null;
    $("remotePair").hidden = true;
    const r = await post("remote/cancel"); // the agent forgets the code: nobody can use it from now on
    toast(r.ok ? tr("Koden är tillbakatagen") : tr("Gick inte: ") + trServer(r.error));
    refresh();
  };
  // ---- The two settings of the computer itself: keep it awake while DAP-Share runs, start DAP-Share at login ----
  $("awakeBtn").onclick = async () => {
    const now = state && state.me.computer && state.me.computer.keep_awake;
    const r = await post("awake", { on: !(now && now.on) });
    if (!r.ok) toast(tr("Gick inte: ") + trServer(r.error));
    refresh();
  };
  $("loginBtn").onclick = async () => {
    const now = state && state.me.computer && state.me.computer.start_at_login;
    const r = await post("login", { on: !(now && now.on) });
    if (!r.ok) toast(tr("Gick inte: ") + trServer(r.error));
    refresh();
  };
  $("interestsIn").oninput = () => { $("interestsIn").dataset.dirty = "1"; };
  $("interestsBtn").onclick = async () => {
    const r = await post("interests", { text: $("interestsIn").value });
    delete $("interestsIn").dataset.dirty;
    toast(r.ok ? tr("Sparat. Dina vänner får det vid nästa möte.") : tr("Gick inte: ") + r.error);
    refresh();
  };
  $("readLibIn").onchange = async () => {
    const r = await post("advisor", { read_library: $("readLibIn").checked });
    toast(r.ok ? tr("Sparat") : tr("Gick inte: ") + r.error);
    refresh();
  };
  $("levelIn").onchange = async () => {
    const v = $("levelIn").value;
    const r = await post("advisor", { level: v === "off" ? null : Number(v) });
    toast(r.ok ? tr(v === "off" ? "AI-agenten är avstängd" : "Sparat") : tr("Gick inte: ") + r.error);
    refresh();
  };
  $("copyBtn").onclick = () => { if (state) copyText(state.me.dap_id).then((ok) => toast(tr(ok ? "Adressen är kopierad" : "Markera adressen och kopiera den själv"))); };

  $("tokenBtn").onclick = async () => {
    const t = await post("token");
    const text = JSON.stringify(t);
    drawQr(text, $("qrCanvas"));
    $("qrBox").hidden = false;
    $("tokenBtn").textContent = tr("Visa en ny kod");
    $("qr").hidden = false; $("qr").textContent = text;
    $("qrUntil").textContent = tr("Gäller en gång, till {t}. Visa den för personen framför dig.", { t: when(t.expires_at) }) + (t.relay ? tr(" Koden bär reläadressen: det går även om ni är på olika nät.") : "");
  };

  // ---- the camera: BarcodeDetector where the browser has it, jsQR everywhere else ----
  function decodeFrame(imageData) {
    const r = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
    return r ? r.data : null;
  }
  async function decodeWithDetector(detector, source) {
    const codes = await detector.detect(source);
    return codes.length ? codes[0].rawValue : null;
  }
  let scanStop = null;
  let scanTo = null; // who gets the text of the code that is scanned next; null: this screen, for a meeting
  const scanned = (text) => { const to = scanTo; scanTo = null; return to ? to(text) : onScanned(text); };
  // startScan(): a meeting code for this screen. startScan(fn): the text goes to fn instead.
  async function startScan(onText) {
    scanTo = typeof onText === "function" ? onText : null;
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { $("scanPhoto").value = ""; return $("scanPhoto").click(); }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }); }
    catch (e) { return toast(tr("Kameran gick inte att öppna: ") + e.message); }
    const video = $("video"); video.srcObject = stream; await video.play();
    $("scanner").style.display = "flex";
    const detector = "BarcodeDetector" in window ? new BarcodeDetector({ formats: ["qr_code"] }) : null;
    const canvas = document.createElement("canvas"); const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let running = true;
    scanStop = () => { running = false; stream.getTracks().forEach((t) => t.stop()); $("scanner").style.display = "none"; scanStop = null; };
    const tick = async () => {
      if (!running) return;
      if (video.readyState >= 2) {
        let text = null;
        try {
          if (detector) text = await decodeWithDetector(detector, video);
          else { canvas.width = video.videoWidth; canvas.height = video.videoHeight; ctx.drawImage(video, 0, 0); text = decodeFrame(ctx.getImageData(0, 0, canvas.width, canvas.height)); }
        } catch {}
        if (text) { scanStop(); return scanned(text); }
      }
      setTimeout(tick, 150);
    };
    tick();
  }
  function onScanned(text) {
    let qr;
    try { qr = JSON.parse(text); } catch { return toast(tr("Det var ingen DAP-kod")); }
    if (!qr.dap_id || !qr.token) return toast(tr("Det var ingen DAP-kod"));
    $("qrIn").value = text;
    toast(tr("Kod skannad: möter {id} …", { id: qr.dap_id.slice(-6) }));
    meet({ qr });
  }
  $("scanBtn").onclick = () => startScan();
  // A photo of the code: drawn onto a canvas (scaled down, so a phone's large picture reads quickly) and read by jsQR.
  $("scanPhoto").onchange = () => {
    const f = $("scanPhoto").files && $("scanPhoto").files[0];
    if (!f) return;
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const r = jsQR(ctx.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: "attemptBoth" });
      if (r && r.data) scanned(r.data); else toast(tr("Ingen kod syntes på bilden. Försök igen, närmare och rakt framifrån."));
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast(tr("Bilden gick inte att läsa")); };
    img.src = url;
  };
  $("scanClose").onclick = () => scanStop && scanStop();
  window.dapShareTest = { drawQr, decodeFrame, onScanned }; // for the browser test

  async function meet(extra) {
    const body = { ...extra };
    // The checkbox of the view the meeting comes from: Add a friend (a scanned code, somebody nearby) or Fetch with a code.
    const fromMeet = !!(body.qr || body.nearby);
    delete body.nearby;
    if ($("codeIn").value) body.code = $("codeIn").value;
    if ($("ctxIn").value) body.context = $("ctxIn").value;
    if (fromMeet ? $("friendIn2").checked : $("friendIn").checked) body.friendRequest = true;
    $("meetBtn").disabled = true;
    busy(extra.qr || extra.dap_id ? tr("möter {id} …", { id: String(or(extra.qr && extra.qr.dap_id, extra.dap_id)).slice(-6) }) : tr("möter …"));
    try {
      const r = await post("meet", body);
      if (r.error) return toast(tr("Mötet misslyckades: ") + r.error);
      if (r.received.length && view !== "waiting") go("waiting"); // what arrived waits there
      toast(tr("Möte med {name}", { name: r.peer.display_name }) + (r.via === "relay" ? tr(" (via relä)") : "") + tr(": tog emot {a}, erbjöd {b}", { a: r.received.length, b: r.offered.length }) + (r.friend_request ? tr(", vänförfrågan {s}", { s: r.friend_request }) : ""));
    } finally { busy(null); $("meetBtn").disabled = false; refresh(); }
  }
  $("meetQrBtn").onclick = () => $("meetBtn").onclick();
  $("meetBtn").onclick = () => {
    const qr = $("qrIn").value.trim();
    if (qr) { try { return meet({ qr: JSON.parse(qr) }); } catch { return toast(tr("Koden gick inte att läsa")); } }
    if ($("hostIn").value.trim()) return meet({ host: $("hostIn").value.trim(), port: Number($("portIn").value) });
    if ($("relayIn").value.trim() && $("dapIn").value.trim()) { const [host, port] = $("relayIn").value.trim().split(":"); return meet({ relay: { host, port: Number(port) }, dap_id: $("dapIn").value.trim() }); }
    if ($("relayIn").value.trim()) return toast(tr("Ange den andras dap:crypto:… bredvid reläet"));
    toast(tr("Fyll i den andras adress, en dator på nätverket eller en skannad kod"));
  };
  // An address typed in under Add a friend: a meeting through the owner's own relay, with a friend request.
  $("addFriendBtn").onclick = () => {
    const dap_id = $("addrIn").value.trim();
    if (!dap_id) return toast(tr("Skriv den andras adress, dap:crypto:…"));
    const relay = state && state.me.relay ? state.me.relay.relay : null;
    if (!relay) return toast(tr("inget relä: möten över internet går inte"));
    return meet({ relay: { host: relay.host, port: relay.port }, dap_id, friendRequest: true });
  };

  async function nearby() {
    try {
      const { agents } = await api("GET", "nearby");
      $("nearbyBox").hidden = !agents.length; // the heading is there only while somebody is nearby
      $("nearby").className = agents.length ? "" : "empty";
      $("nearby").innerHTML = agents.length ? agents.map((a) => `<div class="meeting"><div><b>${esc(a.display_name)}</b> <span class="small">${esc(a.host)}:${esc(a.port)}</span><div class="mono">${esc(a.dap_id)}</div></div><button class="quiet" data-meet-nearby='${esc(JSON.stringify(a))}'>${esc(tr("Mötas"))}</button></div>`).join("") : esc(tr("Ingen annan agent syns på det här nätverket just nu."));
    } catch { $("nearby").textContent = tr("kunde inte söka"); }
  }
  // What a page around this screen may use (the page at /remote/, docs/REMOTE.md §5): the screen's own
  // words, messages, scanner and drawing, so that it looks and speaks like the screen it carries.
  window.dapShare = { api, tr, trServer, toast, busy, refresh, go, drawQr, startScan };

  // The state is asked for every other second, and never twice at once: a slow answer (a line
  // over the mobile network) is waited for, up to 20 seconds, before the next question.
  let pollAt = 0;
  function poll() {
    const t = Date.now();
    if (pollAt && t - pollAt < 20000) return;
    pollAt = t;
    const done = () => { if (pollAt === t) pollAt = 0; };
    refresh().then(done, done);
  }
  refresh().then(() => { const h = location.hash.slice(1); if (h && VIEWS.indexOf(h) > 0) go(h); });
  // Through another door than http (the owner's phone) every question waits for the one before it:
  // there the screen asks who is nearby and what is in the folder only when that view is in front.
  if (!TRANSPORT) nearby();
  folder();
  setInterval(poll, 2000);
  setInterval(() => { if (!TRANSPORT || view === "meet" || view === "friends") nearby(); }, 15000);
  setInterval(() => { if (!TRANSPORT || !folderSeen || view === "send") folder(); }, 5000);
