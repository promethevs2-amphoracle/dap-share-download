# SNB DAP – logotyp

Neongrön `#39FF14` på svart `#0A0B0F`, eller svart på vit `#FFFFFF`. Märket är ett d med två ögon.

| Fil | Användning |
|---|---|
| `app-icon.svg` / `.png` | App-ikon med rundade hörn, strecken tonar ut |
| `app-icon-neon.svg` / `.png` | Appens egen ikon: helt neongrön med bara ögonen, så att den syns bland andra appar. Mac-appen (`AppIcon.icns`, byggd från den med Apples marginal), den installerade appen i webbläsaren och flikens ikon |
| `app-icon-solid.svg` / `.png` | App-ikon med rundade hörn, strecken utan toning (grunden för favicon) |
| `app-icon-animated.svg` | App-ikonen med ögon som blinkar och tittar åt sidorna, sju sekunder i en slinga. Den står stilla de första 1,4 sekunderna, så att märket hinner ses i vila innan första blinkningen (vid 2 sekunder) |
| `green-on-black.svg` / `.png` | Fyrkantig, grön på svart |
| `green-on-black-animated.svg` | Fyrkantig och animerad |
| `black-on-white.svg` / `.png` | Fyrkantig, svart på vit: för ljusa bakgrunder |
| `green-on-white.svg` / `.png` | Fyrkantig, grön på vit (svag kontrast; föredra svart på vit) |
| `folder-icon.svg` / `.png` | Ikonen på ägarens mapp `~/DAP-Share` i Finder: en mörk mapp med neongrön flik och märket. Sätts av `start` på macOS |
| `received-icon.svg` / `.png` | Mappen för det som släppts in: samma form som delningsmappen, i svart och vitt. Grönt är det som går ut, vitt är det som kommit in |
| `favicon.ico` | Favicon, 16, 32 och 48 px |

SVG-filerna är originalen. PNG-filerna är renderade från dem i 512 × 512.

**Animationen** används på landningssidan och som laddare i ägarens app (`src/share/app.html`):
när appen söker agenter i närheten, under ett möte och innan första läget har kommit. Den som har
valt minskad rörelse i sitt system får den stilla ikonen i stället.
