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
      "Det här ändrar du på datorn.": "You change this on the computer."
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
    // The two settings of the computer itself (docs/REMOTE.md §6).
    [/^den här datorn kan inte hållas vaken av DAP-Share$/, () => "this computer cannot be kept awake by DAP-Share"],
    [/^kunde inte hålla datorn vaken$/, () => "could not keep the computer awake"],
    [/^DAP-Share kan inte startas vid inloggning härifrån$/, () => "DAP-Share cannot be started at login from here"],
    [/^kan inte skriva inloggningsfilen: (.*)$/, (m) => `cannot write the login file: ${m[1]}`],
  ];
  function trServer(text) {
    if (LANG !== "en" || typeof text !== "string") return text;
    for (let i = 0; i < SERVER_EN.length; i++) { const m = SERVER_EN[i][0].exec(text); if (m) return SERVER_EN[i][1](m); }
    return text;
  }
  // The markup is written in Swedish; in English every text and placeholder that has a translation is swapped once.
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
    [].forEach.call(document.querySelectorAll("[placeholder]"), (el) => { const k = el.getAttribute("placeholder"); if (EN[k] !== undefined) el.setAttribute("placeholder", EN[k]); });
  })();

  let shelfOpen = null; // the friend whose folder the owner is looking in
  let found = null;     // the last answer from the directory, or null before any search
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
  const when = (iso) => new Date(iso).toLocaleTimeString(LOCALE);
  let state = null;
  let relayFilled = false;
  let remoteCode = null; // the pairing code this page was given: { expires_at, made }. The agent never repeats a code.
  let removeAsk = null;  // the phone the owner pressed Remove on, until the second press
  let folderSeen = false;
  // What is drawn again every other second is only written when it has changed: a button is not replaced under a press.
  const setHtml = (el, html) => { if (el.dapHtml !== html) { el.innerHTML = html; el.dapHtml = html; } };
  const day = (seconds) => new Date(seconds * 1000).toLocaleDateString(LOCALE, { year: "numeric", month: "short", day: "numeric" });
  const dayTime = (seconds) => new Date(seconds * 1000).toLocaleString(LOCALE, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  // One line per meeting. In Swedish the agent's own line is used as it is; in English it is composed from the same counts.
  function meetingLine(m) {
    if (LANG === "sv" && m.line) return m.line;
    const n = m.deliveries.length, who = or(m.sender.display_name, m.sender.dap_id);
    const files = tr(n === 1 ? "{n} fil från {who}" : "{n} filer från {who}", { n, who });
    const colours = !m.red ? tr("alla gröna") : !m.green ? tr("alla röda") : tr(m.red === 1 ? "{g} gröna, {r} röd" : "{g} gröna, {r} röda", { g: m.green, r: m.red });
    const tail = m.awaiting_press ? tr("väntar på ditt tryck") : m.held ? tr("det röda väntar i inkorgen") : tr("i hubben");
    return files + ": " + colours + " – " + tail;
  }

  // ---- the owner's phone as a remote (docs/REMOTE.md §2): the phones, the code to scan, and the
  // question with the four digits. `rc` is undefined everywhere but on the computer's own screen. ----
  function renderRemote(rc, asked) {
    $("remoteCard").hidden = !rc;
    if (!rc) { setHtml($("pairAsk"), ""); return; }
    // A phone waits for the owner's yes: asked on every view, like a friend request. The digits are
    // the session's own; somebody in the middle cannot make the phone show the same ones.
    const p = rc.pairing;
    setHtml($("pairAsk"), p
      ? `<div class="meeting"><div><b>${esc(tr("En telefon vill bli din fjärrkontroll"))}</b><div class="pairName">${esc(tr("Den kallar sig {name}", { name: p.name }))}</div><div class="digits" id="pairDigits">${esc(p.digits)}</div><div class="small">${esc(tr("Tryck ja bara om din egen telefon just nu visar samma fyra siffror. Visar den något annat, eller ingenting: tryck nej. En fjärrkontroll får göra allt du gör här, utom att ändra inställningarna."))}</div></div><div><button data-pair-yes="${esc(p.id)}">${esc(tr("Ja, tillåt"))}</button> <button class="quiet" data-pair-no="${esc(p.id)}">${esc(tr("Nej"))}</button></div></div>`
      : "");
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
    if (removeAsk && !rc.phones.some((x) => x.dap_id === removeAsk)) removeAsk = null;
    setHtml($("remotePhones"), rc.phones.length
      ? rc.phones.map((x) => `<div class="srow"><span><b>${esc(x.name)}</b> <span class="badge${x.online ? "" : " off"}">${esc(tr(x.online ? "ansluten nu" : "inte ansluten nu"))}</span><div class="small">${esc(tr("Tillagd {a} · senast använd {b}", { a: day(x.added), b: dayTime(x.last_seen) }))}</div></span>` +
          (removeAsk === x.dap_id
            ? `<span class="confirm"><span class="small">${esc(tr("Ta bort {name}? Den kommer inte in igen förrän du ansluter den på nytt.", { name: x.name }))}</span><button class="danger tiny" data-phone-remove-yes="${esc(x.dap_id)}">${esc(tr("Ja, ta bort"))}</button> <button class="quiet tiny" data-phone-remove-no="1">${esc(tr("Avbryt"))}</button></span>`
            : `<button class="danger tiny" data-phone-remove="${esc(x.dap_id)}">${esc(tr("Ta bort"))}</button>`) + `</div>`).join("")
      : `<div class="empty">${esc(tr("Ingen telefon är ansluten än."))}</div>`);
  }

  async function refresh() {
    const asked = Date.now();
    let now;
    try { now = await api("GET", "state"); } catch { return; }
    if (!now || !now.me) return; // not an answer about the agent (a refusal, or a line that is not up yet)
    state = now;
    // The owner's phone as a remote: the agent says so (me.remote). What a remote may not do
    // (docs/REMOTE.md §4) is not offered there, and where one is stays in view.
    const far = !!state.me.remote;
    $("remoteHere").hidden = !far;
    $("remoteNote").hidden = !far;
    if (far) {
      $("remoteHere").textContent = tr("Fjärrkontroll: din telefon når {name}, krypterat hela vägen.", { name: state.me.display_name });
      $("remoteNoteText").textContent = tr("Det här är din telefon som fjärrkontroll för {name}. Inställningarna ändrar du på datorn: AI-agenten, det du gillar, vem som hittar dig, vad dina vänner ser, telefonerna och att stänga av.", { name: state.me.display_name });
    }
    renderRemote(far ? undefined : state.me.remote_control, asked);
    $("who").textContent = state.me.display_name;
    $("myId").textContent = state.me.dap_id;
    $("openFolderBtn").disabled = !state.me.can_open_folder;
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

    const waiting = state.meetings.reduce((n, m) => n + (m.awaiting_press || 0), 0);
    $("homeNotice").hidden = !waiting || view === "receive";
    $("homeNotice").textContent = tr(waiting === 1 ? "{n} fil väntar på ditt ja. Visa" : "{n} filer väntar på ditt ja. Visa", { n: waiting });
    const byId = {}; state.inbox.forEach((d) => { byId[d.id] = d; }); // not Object.fromEntries: Chrome 73+
    $("meetings").innerHTML = state.meetings.length
      ? state.meetings.map((m) => `<div class="meeting"><div><span class="dot ${m.red ? "red" : "green"}"></span><span class="line">${esc(meetingLine(m))}</span><div class="small">${esc(tr(m.lane === "friend" ? "vän" : "främling"))} · ${m.deliveries.map((id) => esc(byId[id] && byId[id].item.filename)).join(", ")}</div></div>` +
          (m.awaiting_press ? `<button class="big" data-release="${esc(m.meeting_id)}">${esc(tr("Släpp in de gröna ({n})", { n: m.awaiting_press }))}</button>` : "") + `</div>`).join("")
      : '<div class="empty">' + esc(tr("Här visas det du tar emot.")) + "</div>";

    $("inbox").innerHTML = state.inbox.filter((d) => d.status !== "discarded").map((d) => `<tr>
      <td><span class="dot ${esc(d.report.colour)}"></span></td>
      <td>${esc(d.item.filename)}<div class="small">${esc(d.item.title)}</div></td>
      <td>${esc(or(d.sender.display_name, d.sender.dap_id))}</td>
      <td>${esc(trServer(d.report.what))}</td>
      <td>${[...d.report.findings, ...d.report.notes].map((x) => esc(trServer(x))).join("<br>")}</td>
      <td>${esc(d.status === "held" ? tr("väntar") : d.status === "released" ? tr("i hubben ({f})", { f: d.released_to }) : d.status)}</td>
      <td>${d.status === "held" ? `<button class="quiet" data-item="${esc(d.id)}">${esc(tr("Släpp in"))}</button> <button class="danger" data-discard="${esc(d.id)}">${esc(tr("Kasta"))}</button>` : ""}</td>
    </tr>`).join("") || '<tr><td colspan="7" class="empty">' + esc(tr("Tomt.")) + "</td></tr>";

    $("requests").innerHTML = state.friend_requests.map((r) => `<div class="meeting"><div>${esc(tr("Vänförfrågan från"))} <b>${esc(r.display_name)}</b><div class="mono">${esc(r.dap_id)}</div></div><div><button data-accept="${esc(r.dap_id)}">${esc(tr("Acceptera"))}</button> <button class="quiet" data-decline="${esc(r.dap_id)}">${esc(tr("Avböj"))}</button> <button class="quiet" data-block="${esc(r.dap_id)}" data-block-name="${esc(r.display_name)}">${esc(tr("Blockera"))}</button></div></div>`).join("")
      + (state.requests_held_back ? `<div class="small" style="margin:0 0 8px">${esc(tr(state.requests_held_back === 1 ? "1 vänförfrågan till hölls tillbaka den senaste timmen (högst 10 nya i timmen)." : "{n} vänförfrågningar till hölls tillbaka den senaste timmen (högst 10 nya i timmen).", { n: state.requests_held_back }))}</div>` : "");
    $("contacts").innerHTML = state.contacts.map((c) => `<tr><td><b>${esc(c.display_name)}</b><div class="mono">${esc(c.dap_id)}</div>${c.interests ? `<div class="likes">${esc(tr("Gillar: "))}${esc(c.interests)}</div>` : ""}</td><td>${esc(tr(c.lane === "friend" ? (c.receive_without_button ? "vän, utan knapp" : "vän, med knapp") : "främling"))}</td><td>${c.lane === "friend" && state.me.live_folder !== undefined ? `<button data-browse="${esc(c.dap_id)}">${esc(tr("Visa mappen"))}</button> ` : ""}${c.lane === "friend" ? `<button class="quiet" data-demote="${esc(c.dap_id)}">${esc(tr("Gör till främling"))}</button>` : ""} <button class="danger" data-remove="${esc(c.dap_id)}">${esc(tr("Ta bort"))}</button> <button class="quiet" data-block="${esc(c.dap_id)}" data-block-name="${esc(c.display_name)}">${esc(tr("Blockera"))}</button></td></tr>`).join("") || '<tr><td class="empty">' + esc(tr("Inga kontakter.")) + "</td></tr>";
    // ---- friends see the share folder as it is: asked once, changed under Friends. An agent that
    // does not have it (the Node agent) says nothing about it, and nothing is shown. ----
    // ---- being found: asked once, changed under Friends. Only when this relay keeps a directory. ----
    const dir = state.me.directory;
    const mayList = !!(dir && dir.available);
    $("goFriends").hidden = state.me.live_folder === undefined; // an agent without friends' folders or a directory (the Node agent)
    $("findCard").hidden = !dir;
    $("listAsk").innerHTML = mayList && dir.listed === null && !far // on a remote the two questions are not asked: they are answered on the computer
      ? `<div class="meeting"><div><b>${esc(tr("Ska andra kunna hitta dig?"))}</b><div class="small">${esc(tr("Den som har appen kan se ditt namn och skicka en vänförfrågan. Bara vänner du accepterar ser dina filer. Du kan ändra dig under Vänner."))} <a href="${esc(PRIVACY)}" target="_blank" rel="noopener">${esc(tr("Vad som visas och sparas"))}</a></div></div><div><button data-listed="yes">${esc(tr("Ja, gör mig synlig"))}</button> <button class="quiet" data-listed="no">${esc(tr("Nej"))}</button></div></div>`
      : "";
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
    $("found").innerHTML = found === null ? "" : found.entries.length
      ? found.entries.map((p) => `<div class="meeting"><div><b>${esc(p.display_name)}</b><div class="mono">${esc(p.dap_id)}</div></div><div>${
          (state.blocked || []).some((b) => b.dap_id === p.dap_id) ? esc(tr("blockerad"))
          : friendIds[p.dap_id] ? esc(tr("vän"))
          : askingIds[p.dap_id] ? `<button data-accept="${esc(p.dap_id)}">${esc(tr("Acceptera"))}</button>`
          : askedIds[p.dap_id] ? esc(tr("frågad, väntar på svar"))
          : `<button data-ask="${esc(p.dap_id)}">${esc(tr("Bli vänner"))}</button>`}</div></div>`).join("") + (found.total > found.entries.length ? `<div class="small">${esc(tr("Visar {a} av {b}. Sök på ett namn för att hitta fler.", { a: found.entries.length, b: found.total }))}</div>` : "")
      : `<div class="empty">${esc(tr("Ingen hittades."))}</div>`;
    const blockedNow = state.blocked || [];
    $("blockedList").innerHTML = blockedNow.length
      ? `<div class="small" style="margin-top:12px">${esc(tr("Blockerade. De får inget från dig och deras förfrågningar visas inte. De får inte veta att de är blockerade."))}</div>` +
        blockedNow.map((b) => `<div class="srow"><span>${esc(b.display_name)} <span class="mono small">${esc(b.dap_id)}</span></span><button class="quiet tiny" data-unblock="${esc(b.dap_id)}">${esc(tr("Häv blockering"))}</button></div>`).join("")
      : "";
    const waitingFor = (state.asked || []).filter((a) => !friendIds[a]);
    $("asked").innerHTML = waitingFor.length ? esc(tr("Väntar på svar från: ")) + waitingFor.map((a) => `<span class="mono">${esc(a)}</span>`).join(", ") : "";
    const live = state.me.live_folder;
    $("liveAsk").innerHTML = live === null && !far && !$("listAsk").innerHTML
      ? `<div class="meeting"><div><b>${esc(tr("Ska dina vänner se din delningsmapp?"))}</b><div class="small">${esc(tr("Då kan vänner du har accepterat hämta det som ligger i mappen, utan att du delar fil för fil. Ingen annan ser den. Du kan ändra dig under Vänner."))}</div></div><div><button data-live="yes">${esc(tr("Ja, visa den för mina vänner"))}</button> <button class="quiet" data-live="no">${esc(tr("Nej, jag väljer själv varje gång"))}</button></div></div>`
      : "";
    $("liveRow").hidden = live === undefined;
    $("liveBadge").textContent = live ? tr(state.me.live_files === 1 ? "på: {n} fil" : "på: {n} filer", { n: state.me.live_files }) : tr("av");
    $("liveBadge").className = "badge" + (live ? "" : " off");
    $("liveBtn").textContent = tr(live ? "Stäng av" : "Slå på");
    $("liveBtn").dataset.live = live ? "no" : "yes";
    $("liveBtn").hidden = far;
    // What the friend the owner is looking at holds out: picked for them, shared with them, and the friend's folder.
    const sh = (state.shelves || []).filter((x) => x.dap_id === shelfOpen)[0];
    const shelfRow = (it) => `<tr><td>${esc(it.filename)}<div class="small">${esc(or(KIND_NAMES[it.kind], it.kind))} · ${kb(it.size_bytes)}</div></td><td style="text-align:right">${it.have ? esc(tr("du har den")) : `<button class="quiet" data-fetch="${esc(it.id)}">${esc(tr("Hämta"))}</button>`}</td></tr>`;
    const shelfPart = (title, items) => (items.length ? `<div class="small" style="margin-top:10px">${esc(title)}</div><table><tbody>${items.map(shelfRow).join("")}</tbody></table>` : "");
    $("shelf").innerHTML = sh
      ? `<div class="meeting" style="display:block"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><b>${esc(tr("Hos {name}", { name: or(sh.display_name, "") }))}</b><span>${sh.items.some((it) => !it.have) ? `<button data-fetch-all="1">${esc(tr("Hämta alla"))}</button> ` : ""}<button class="quiet" data-shelf-close="1">${esc(tr("Stäng"))}</button></span></div>` +
        (sh.items.length
          ? shelfPart(tr("Utvalt åt dig"), sh.items.filter((it) => it.picked)) + shelfPart(tr("Delat med dig"), sh.items.filter((it) => !it.picked && !it.live)) + shelfPart(tr("I mappen"), sh.items.filter((it) => it.live && !it.picked))
          : `<div class="empty">${esc(tr("Inget just nu."))}</div>`) + `</div>`
      : "";
    const metOnly = state.met.filter((m) => !state.contacts.some((c) => c.dap_id === m.dap_id));
    $("met").innerHTML = metOnly.length ? esc(tr("Träffade: ")) + metOnly.map((m) => `${esc(m.display_name)} <button class="quiet" data-befriend="${esc(m.dap_id)}">${esc(tr("gör till vän"))}</button>`).join(" · ") : "";
    $("journal").innerHTML = state.journal.slice(-30).reverse().map((j) => `<tr><td class="small">${when(j.time)}</td><td class="mono">${esc(j.dap_id)}</td><td>${esc(j.kind)} ${kb(j.size_bytes)}</td><td class="small">${esc(or(j.outcome, or(j.colour, "")))}</td></tr>`).join("") || '<tr><td class="empty">' + esc(tr("Tomt.")) + "</td></tr>";

    const AUD = { MET_IN_PERSON: tr("den jag träffar fysiskt"), FRIENDS: tr("vänner"), LISTED: tr("namngivna"), ANYONE_WITH_CODE: tr("den som har koden") };
    const byAdvisor = new Set(((state.advisor && state.advisor.shares) || []).map((s) => s.index));
    $("policies").className = state.policies.length ? "" : "empty";
    $("policies").hidden = !state.policies.length;
    $("shareNext").hidden = !state.policies.length;
    $("sendBox").hidden = !state.policies.length;
    // The code of the share just made, large, for reading out loud. Only this page knows it.
    $("codeBig").hidden = !(lastCode && state.policies.some((p) => p.audience === "ANYONE_WITH_CODE"));
    $("codeBig").textContent = lastCode || "";
    if (view === "send" && step === 3 && !state.policies.length) setStep(1); // the last share was stopped
    $("policies").innerHTML = state.policies.length
      ? state.policies.map((p, i) => `<div class="meeting"><div><b>${p.items.map((it) => esc(it.filename)).join(", ")}</b><div class="small">${esc(tr("till {who}", { who: or(AUD[p.audience], p.audience) }))}${p.context ? " · " + esc(p.context) : ""}${p.listed ? " · " + esc(tr("{n} identiteter", { n: p.listed.length })) : ""} · ${esc(tr("till {when}", { when: new Date(p.valid_until).toLocaleString(LOCALE) }))}${byAdvisor.has(i) ? " · <b>" + esc(tr("delat av rådgivaren")) + "</b>" : ""}</div></div><button class="danger" data-unshare="${i}" data-what="${esc(policyKey(p))}">${esc(tr("Sluta dela"))}</button></div>`).join("")
      : esc(tr("inget"));

    // ---- the AI agent (the advisor): a model that may look, propose or share inside the owner's rules; never more ----
    const adv = state.advisor;
    $("advisorPanel").hidden = !adv;
    $("asks").innerHTML = "";
    if (adv) {
      const LEVEL = { 0: tr("nivå 0, titta: ser mappen och läget, inget mer"), 1: tr("nivå 1, föreslå: lägger förslag här, du säger ja eller nej"), 2: tr("nivå 2, inom regler: delar själv, men bara inom dina regler"), 3: tr("nivå 3: delar själv med vänner, utan gränser") };
      $("advisorHint").textContent = adv.off
        ? tr("Avstängd. Ingen AI-agent kommer åt DAP-Share.")
        : tr("En modell kan tala med agenten ({level}). Den når aldrig knappen, slussen, vännerna eller innehållet.", { level: LEVEL[adv.level] }) + (adv.level === 2 && adv.rules ? tr(" Regler: {aud}, högst {h} h, högst {f} filer åt gången", { aud: adv.rules.audiences.map((a) => or(AUD[a], a)).join(", "), h: adv.rules.max_hours, f: adv.rules.max_files }) + (adv.rules.kinds ? tr(", bara {x}", { x: adv.rules.kinds.join(", ") }) : "") + (adv.rules.files ? tr(", bara {x}", { x: adv.rules.files.join(", ") }) : "") + "." : "");
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
      const pending = adv.proposals.filter((p) => p.status === "pending");
      const decided = adv.proposals.filter((p) => p.status !== "pending").slice(-5).reverse();
      const STATUS = { accepted: tr("du sa ja"), declined: tr("du sa nej"), withdrawn: tr("togs tillbaka") };
      // What waits for the owner's yes or no is shown at the top, like a friend request.
      $("asks").innerHTML = pending.map((p) => `<div class="meeting"><div>${esc(tr("Din AI-agent föreslår att du delar"))} <b>${p.files.map(esc).join(", ")}</b><div class="small">${esc(tr("till {who} i {h} h", { who: or(AUD[p.audience], p.audience), h: p.hours }))}${p.context ? " · " + esc(p.context) : ""}${p.listed ? " · " + esc(tr("{n} identiteter", { n: p.listed.length })) : ""}${p.note ? " · ”" + esc(p.note) + "”" : ""} · ${when(p.at)}</div>${p.audience === "ANYONE_WITH_CODE" ? `<div class="row"><input data-code-for="${esc(p.id)}" placeholder="${esc(tr("kod (minst 6 tecken) – du väljer den, inte rådgivaren"))}"></div>` : ""}</div><div><button data-accept-proposal="${esc(p.id)}">${esc(tr("Dela"))}</button> <button class="quiet" data-reject-proposal="${esc(p.id)}">${esc(tr("Avböj"))}</button></div></div>`).join("");
      $("proposals").innerHTML = decided.length ? `<div class="small">${decided.map((p) => `${when(or(p.decided_at, p.at))} ${p.files.map(esc).join(", ")} → ${or(STATUS[p.status], esc(p.status))}`).join("<br>")}</div>` : "";
    }
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
      if (!r.folder) return;
      $("openFolderBtn").disabled = !(state && state.me.can_open_folder);
      $("folderHint").textContent = r.folder.split(/[\\/]/).slice(-2).join("/");
      $("folderHint").title = r.folder;
      const checked = new Set([...document.querySelectorAll("#folder input:checked")].map((i) => i.value));
      folderFiles = r.files;
      $("folder").innerHTML = r.files.map((f) => `<tr><td><input type="checkbox" value="${esc(f.filename)}" ${f.shareable ? "" : "disabled"} ${checked.has(f.filename) ? "checked" : ""}></td><td>${esc(f.filename)}</td><td class="small">${[KIND_NAMES[f.kind], trServer(f.label), kb(f.size_bytes)].filter(Boolean).map(esc).join(" · ")}</td><td class="small">${f.shareable ? "" : esc(tr("delas inte: ") + trServer(f.reason))}</td></tr>`).join("") || '<tr><td class="empty">' + esc(tr("Mappen är tom.")) + "</td></tr>";
    } catch {}
  }
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

  // ---- the screens: one question first (home), then one thing at a time ----
  const VIEWS = ["home", "send", "receive", "meet", "friends", "settings"];
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
  function go(to) {
    if (VIEWS.indexOf(to) < 0) to = "home";
    view = to;
    [].forEach.call(document.querySelectorAll(".view"), (el) => { el.hidden = el.getAttribute("data-view") !== to; });
    $("backBtn").hidden = to === "home";
    if (to === "send") setStep(state && state.policies.length ? 3 : 1);
    if (to === "meet" && $("qrBox").hidden) $("tokenBtn").click(); // the code is what this screen is for: show it at once
    if (TRANSPORT && to === "meet") nearby();
    if (TRANSPORT && to === "send") folder();
    try { if (location.hash.slice(1) !== (to === "home" ? "" : to)) history.pushState(null, "", to === "home" ? location.pathname + location.search : "#" + to); } catch (e) {}
    window.scrollTo(0, 0);
    if (state) refresh();
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
    const b = e.target.closest("button"); if (!b) return;
    const d = b.dataset;
    if (d.send) return sendInvite(d.send);
    if (d.go) return go(d.go);
    if (d.stepGo) return setStep(Number(d.stepGo));
    if (d.release) { const r = await post("release", { meeting_id: d.release }); toast(tr("{a} släpptes in, {b} väntar", { a: r.released.length, b: r.kept.length })); }
    else if (d.item) { await post("release", { delivery_id: d.item }); toast(tr("Insläppt i hubben")); }
    else if (d.discard) { await post("discard", { delivery_id: d.discard }); toast(tr("Kastad")); }
    else if (d.accept) { await post("friends", { dap_id: d.accept }); toast(tr("Vän tillagd")); }
    else if (d.decline) { await post("friends/decline", { dap_id: d.decline }); }
    else if (d.block) {
      if (!confirm(tr("Blockera {name}? De får inget från dig, och deras förfrågningar visas inte. De får inte veta det.", { name: d.blockName || d.block }))) return;
      const r = await post("friends/block", { dap_id: d.block, display_name: d.blockName });
      if (r.error) toast(tr("Gick inte: ") + r.error); else { toast(tr("Blockerad")); if (shelfOpen === d.block) shelfOpen = null; }
    }
    else if (d.unblock) { await post("friends/unblock", { dap_id: d.unblock }); toast(tr("Blockeringen är hävd")); }
    else if (d.demote) { await post("friends/demote", { dap_id: d.demote }); }
    else if (d.remove) { await post("friends/remove", { dap_id: d.remove }); }
    else if (d.befriend) { await post("friends", { dap_id: d.befriend }); toast(tr("Vän tillagd")); }
    else if (d.listed) { await post("listed", { on: d.listed === "yes" }); toast(tr(d.listed === "yes" ? "Nu kan andra hitta dig" : "Du syns inte i katalogen")); }
    else if (d.ask) {
      busy(tr("skickar vänförfrågan …"));
      try {
        const r = await post("friends/ask", { dap_id: d.ask });
        if (r.error) toast(tr("Gick inte: ") + r.error);
        else toast(tr(r.friend_request === "accepted" ? "Ni är vänner nu" : r.later ? "Förfrågan skickas när de är online" : "Vänförfrågan skickad"));
      } finally { busy(null); }
    }
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
    else if (d.meetNearby) { const a = JSON.parse(d.meetNearby); await meet({ host: a.host, port: a.port }); }
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
    if ($("codeIn").value) body.code = $("codeIn").value;
    if ($("ctxIn").value) body.context = $("ctxIn").value;
    if ($("friendIn").checked || $("friendIn2").checked) body.friendRequest = true;
    $("meetBtn").disabled = true;
    busy(extra.qr || extra.dap_id ? tr("möter {id} …", { id: String(or(extra.qr && extra.qr.dap_id, extra.dap_id)).slice(-6) }) : tr("möter …"));
    try {
      const r = await post("meet", body);
      if (r.error) return toast(tr("Mötet misslyckades: ") + r.error);
      if (view !== "receive") go("receive"); // what arrived is shown there
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

  async function nearby() {
    try {
      const { agents } = await api("GET", "nearby");
      $("nearby").className = agents.length ? "" : "empty";
      $("nearby").innerHTML = agents.length ? agents.map((a) => `<div class="meeting"><div><b>${esc(a.display_name)}</b> <span class="small">${esc(a.host)}:${esc(a.port)}</span><div class="mono">${esc(a.dap_id)}</div></div><button class="quiet" data-meet-nearby='${esc(JSON.stringify(a))}'>${esc(tr("Möt"))}</button></div>`).join("") : esc(tr("Ingen annan agent syns på det här nätverket just nu."));
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
  setInterval(() => { if (!TRANSPORT || view === "meet") nearby(); }, 15000);
  setInterval(() => { if (!TRANSPORT || !folderSeen || view === "send") folder(); }, 5000);
