# PROMPT.md — rebuild Bogusia / Pile Match from scratch

> Paste the prompt below into an AI coding agent (e.g. Arena.ai Agent Mode) with an
> empty workspace and it will recreate this project. It encodes the full spec plus
> every constraint learned over versions up to v4.55 — including the mistakes to avoid.

---

## The prompt

Build me a complete, senior-friendly **mahjong-solitaire pair-matching game** called
**“Pile Match” (app: Bogusia, package `com.bogusia.pilematch`)** as:

1. a **single-file HTML5 game** (`index.html` — all CSS/JS inline, no frameworks, no
   external JS/CSS), plus
2. a **Capacitor 6 Android wrapper** that packages it into a debug APK.

The player is a senior Polish woman: default to large readable UI, high contrast,
big touch targets, gentle animations, and Polish/English bilingual UI.

### Core gameplay

- A pile of tiles is stacked in layers on a board (x, y grid; z = layer with 10 px
  vertical step). Tiles are **84×110 px** (`--tile-w: 84px; --tile-h: 110px`) — this
  size is sacred and must be **identical in every mode and every game, forever**.
- Tap two identical **free** tiles to remove them; clear the board to win.
- Faces come from selectable tile sets: 6×6 PNG sprite sheets (120×160 cells), plain
  blocks, and dot/emoji styles. Provide food, geometric, minecraft, block variants,
  dot sets (default), and two “riichi” mahjong sheets (light + dark). **Riichi sheets:
  cells 31 and 34 are blank, cell 35 is the tile back — filter all three out, leaving
  33 playable faces.** Optional 🎲 random-set-per-game.
- Toolbar: 💡 Hint, ↩ Undo, 🔀 Shuffle, 🗺 Layout, 🏆 Results, tester name field.
  Results live in localStorage and are **split per mode** (Classic / Hold-5 tabs,
  records carry a `mode` field; tap a result to replay it in its own mode; clear
  wipes only the visible list).

### Two modes (segmented control on start screen + in settings)

**Classic** — standard mahjong solitaire free rule (not covered, one side open).
Layouts: Easy 72, Medium 112, Turtle 144, Senior 72, Bricks 74, plus “Structures”.
Auto-zoom to fit may go up to 1.8×.

**Hold 5 (Pasek 5)** — the signature mode and the **default mode** (with the Mahjong/riichi tile set as the default face set):

- Tapped tiles **fly into a holding bar of 5 pockets** (smooth arc flight, natural
  tile size ending at `scale(0.72)` in the pocket, with **one gentle 360° spin**;
  dot-style faces must not re-flow mid-flight — render the ghost at natural tile size).
- Two identical tiles in the bar vanish automatically (scale-out 0.72→0.8→0).
- **STRICT RULE: all 5 pockets full with no pair = game over.** No rescue by a
  matching board tile — that escape hatch existed once and was deliberately removed.
  Bar-full dialog is one short sentence + undo/shuffle buttons — and Shuffle there
  must ALSO free a pocket (return the newest bar tile first), otherwise the prompt
  loops forever since reshuffling the board can't empty pockets.
- **Win finish (Hold-5):** dialog shows score + place achieved ("place X of Y"),
  exactly two buttons (▶ New game / 🏠 Start screen) — never a wall of text, and
  keep ALL popups terse everywhere (changes are announced in settings notes, not
  in dialogs). A recorded male voice congratulates by rank: "Gratulacje!" (any
  win) / "Szczere gratulacje!" (top 10) / "Super gratulacje!" (top 3) /
  "Mistrzostwo!" (#1 — followed by a ~2 s fanfare, synthesized via WebAudio, with
  short falling golden confetti). EN clip variants too; TTS only as fallback.
- **Relaxed free rule:** a tile is blocked ONLY when covered from above
  (≈0.9 tile-height tolerance). No left/right side-block.
- Board layout is ALWAYS a **Structure** (below); auto-zoom **capped at 1.0×** so
  tiles never differ in size from Classic.
- Background music plays in this mode only.

### Structures (procedural layouts, Hold-5 + the “Structures” classic layout)

Each game picks one random composition from a pool of generator functions. Hard
requirements for every generated structure (write a Node test harness that extracts
the generator section between marker comments and asserts all of these for every
generator — run it before every build):

- even tile count, **between 44 and 80 tiles**
- no duplicate (x, y, z) positions
- nothing floats: every tile above ground is supported (prune unsupported)
- **fully drainable**: repeatedly removing any free pair empties the pile
- **ground level fills ≥ 50% of the structure’s bounding box** — never skinny
  2-column rails, never sparse scatterings
- **at least 3 columns wide**
- each generator has a `.disp` display name plus measured `.diff` (0.80–1.25
  scoring weight) and `.stars` (1–5); with debug mode on, show
  “🏗 name • N tiles • ★★★☆☆” top-left during Hold-5
- hard structures pay more: match points' speed component is multiplied by the
  structure's difficulty weight (measure it with the Monte-Carlo harness, never guess)
- no negative x coordinates (rendering starts at x=0)

Tooling: `tests/analyze-structures.mjs` (Node) extracts the generators between the
markers and runs the asserts **plus** a Monte-Carlo analyzer — N random deals per
structure per mode with the real rules (classic side-block / bar5 top-only, faces
dealt as 4-copy groups over 36 types), reporting win rate, deadlocks, bar-fulls, bar
pressure, solution length and type diversity, and emitting per-structure ★ rating +
scoring weight. Drainability must be tested with randomized orders (fixed orders
strand vertical stacks even under the top-only rule); ground coverage is measured on
the ground layer's own footprint.

**30 structures = a 10-level climb — 3 random builds per level** (`LEVEL_POOLS`,
ordered easy → hard by the measured Monte-Carlo `diffB`; each deal draws one build
from the level's pool at random; beat the highest unlocked level to unlock the
next — `pm_h5level`; replay any unlocked level with ◀ ▶ on the start screen —
`pm_h5sel`;
the start line shows `Poziom N / 10 • ★… • 🎲×3`, the footer shows level + ★ during
play; debug tag shows “🏗 Lv N name • tiles • ★…”; `LVL_TOTAL = LEVEL_POOLS.length`).
**v4.55 hard rule: every build fits a 6×6 box** — max coordinate span 5 on every
layer, enforced by the analyzer — so nothing ever needs panning on a phone:

1. honeycomb (54) · mini donut ring (48) · micro bridges (50) — ★ w .80
2. meadow + caps (44) · micro terraces (66) · sender tower (60) — ★ w .80
3. mini canyon (60) · twin rails (52) · four garden beds (52) — ★★ w .80
4. picnic benches (46) · courtyard walls (48) · mini checker + caps (48) — ★★ w .80
5. mini windmill (48) · four keeps + mound (76) · crown table (58) — ★★★ w .80
6. crush plate (62) · volcano (48) · zigzag posts (48) — ★★★ w .80
7. four towers + caps (72) · twin mounds (46) · concentric offset rings (68) — ★★★★ w .80
8. great wall micro (44) · twin chimneys mini (62) · pagoda plate (72) — ★★★★ w .92
9. micro ziggurat (58) · twin pagodas (54) · mini keep (54) — ★★★★★ w 1.25
10. deep spire (58) · 3-column skyscraper (50) · narrow bell tower (54) — ★★★★★ w 1.25

Difficulty insight (v4.52, re-confirmed v4.55): barely anything correlates with
covered-%; what drives bar-fulls is **how few tiles are free mid-game** — wide flat
plates (crush plate, sender tower, four keeps) play EASY under the top-only rule no
matter how dramatic they look, while narrow tall towers with offset floors (deep
spire, skyscraper, bell tower) are the real bosses. Classic mode picks one random
structure from the same 30-build flat pool (`STRUCTURE_GENS = LEVEL_POOLS.flat()`).

### Scoring

Per matched pair: `mult = 1 + clamp((10−Δt)/5, 0, 2)` (up to 3× speed bonus);
streak increments when Δt ≤ 5 s; **streak bonus only from streak ≥ 4**:
`min(25, (streak−3)×5)`; points = `round(10×mult×structureWeight) + bonus` (weight = the level's tier weight `LEVEL_META` in Hold-5, the drawn structure's own weight in Classic).
Bravo voice + on-screen 👏 effect trigger with the streak bonus.

Penalties (both reset the streak and show a red "−N" bubble): shuffle costs
`min(60, 10 + 8×uses + ⌈pairsLeft/3⌉)`; **undo costs points** — `12 + 6×uses`
capped at 34 in Classic, `18 + 6×uses` capped at 40 in Hold-5 (pricier there,
since undo is the only rescue from a full bar).

### Audio (recorded MP3 files in `sounds/`)

- **“Bravo!” / “Brawo!” streak voice** (renamed from Fire/Ogień in v4.52): natural-sounding recorded clips
  (1 EN clip, 5 PL clips mixing masculine/feminine). Rules: random pick that
  **never repeats the previous clip**, **8-second global throttle**, human TTS only
  as fallback if files are missing.
- **Background music (Hold-5 only)**: 2 tracks alternating with a ~1.3 s **crossfade**
  between them, gentle ~2.6 s fade-in on start, fade-out on win/exit, and **each
  playback starts at a random point 0–40 s** in. Music volume slider default **13**
  where **slider 100% = 0.55 actual loudness** — music stays in the background.
- **Ambience (Hold-5 only)**: real recorded loops — **rainfall + woodland birdsong**
  (CC BY-SA files with a CREDITS.md attribution; looped, soft per-element fades)
  behind its own 🌧 slider (default **8**), mixed at **70% of the music range**
  (rain ×0.9, birds ×0.55 of that target).
- **Hold-5 backdrop**: a soft **blurred rainy-forest photo** behind the board
  (CSS pseudo-element, **2.5px blur** brightness 0.74 — sharpened in v4.52; the start
  screen reuses the same photo at **1px blur**, v4.55; Classic keeps
  the plain felt gradient).
- **Match sound = pentatonic ladder**: each cleared pair plays the next soft note
  (sine with two faint partials, ~0.4 s) ascending C-D-E-G-A…; the ladder resets
  after ~6 s of silence. Replacing pairs burst into ~7 golden petals drifting up.
- Effects volume, music and ambience sliders each have their **own checkbox** — a
  channel can be muted without losing its slider value (`pm_volen/pm_musen/pm_amben`).
- UI click/match sounds behind a master volume slider (default 70) and a sound
  toggle; vibration via Capacitor Haptics with `navigator.vibrate` fallback.

### Intro & hold bar (v4.53, finale redone v4.55)

- **Intro on every launch (~4 s, tap to skip)**: Shrek-style frames — grandma with
  glasses on a cottage couch → over-shoulder shot of her playing mahjong on her
  smartphone → **grandma's human hands holding the phone, showing the REAL in-game
  screenshot** (PIL perspective-composite of an actual Pile Match capture, rounded
  corners + glass shine) with a gold serif **Witaj! / Welcome!** (`I18N.introWelcome`
  — real overlaid text, never baked into an image). Implemented as 3 AI JPGs
  (`intro/intro-1..3.jpg`) cross-fading with CSS Ken-Burns zooms; after the intro the
  start prompt appears, floating **over the in-game forest at blur(1px)** (v4.55 —
  nearly sharp; it used to be a 10px dim backdrop).
- **Hold bar = floating marble slab**: `position:fixed` over the top-center of the
  board (NO page band, `body.mode-bar5 #hold-bar` display only), smooth **marble
  veins** (soft diagonal gradients — no speckle dots), pockets are polished carved
  hollows with a **gold glowing `.droptarget` outline** during drags. Stones sit
  **above** the slab (`overflow:visible`, mini z-index 2, drop-shadows).
- **Drag & drop tiles onto the bar**: in Hold-5 the dragged stone becomes a
  **fixed-position ghost rendering above the marble bar** (`dragGhost`, z-index 260000,
  source tile dims to 28%); `barTargetIdx(x,y)` computes the auto-sorted insertion
  pocket (first empty — auto-sort unchanged) and it glows gold; dropping calls
  `onBarPick(tile, ghostRect)` (flight starts where you let go; full bar flashes).
  Classic drag keeps the old in-board translate.
- **Board fit never hides under the bar** (`boardTopInset()` in `fitAndCenter` and
  `clampPan`), and in Hold-5 stones are **never smaller than the bar pockets** —
  fit scale floor `0.762 = 64/84`; the widest builds are panned instead of shrunk.
  Win dialogs use a bigger golden glowing congrats style (`.winbig`).
### Changelog placement (v4.54)

Version notes never appear in popups (start/win/lost prompts stay terse). The one
place for them is **Settings → 📋 Changes/Zmiany**, which opens a small dialog showing
the current `I18N.legal` text. `I18N.legal`/`settingsNote` are still updated every
version in BOTH locales.

### Settings (persist everything in localStorage)

Volume 70 · music volume 25 · sound on/off · vibration on/off · bubble animations
on/off · 3D/simple rendering · tile set picker + random toggle · ✔/🔒 free-tile
badges toggle · 🔍 debug overlay · mode classic/bar5 · language EN/PL · tester name
(default “Guest” / “Bogusia”). Settings dialog + start screen both fully bilingual;
settings reset restores all defaults (incl. music 25).

### Localization

Full `I18N = { en: {...}, pl: {...} }` covering every user-visible string; auto-detect
Polish via `navigator.language`, manual switch in header. Version info string and
settings “what’s new” note exist in both languages and are bumped every release.

**Tile sets**: 14 face sets incl. **Mahjong HD** — 36 individual riichi tiles
(240×320 PNGs with transparency; Man/Pin/Sou 1–9, 4 winds, 2 dragons, 3 red fives
that are *distinct* matching faces) — it is the default set. Classic sprite-sheet
sets (riichi light/dark: skip cells 31/34/35) stay available.

### Visual design

Dark-green felt aesthetic (radial gradients, rounded tile corners, soft shadows),
big rounded footer buttons, deluxe animated popups, responsive fit-and-center board,
portrait-phone first. Touch-friendly: nothing essential smaller than ~41 px.

### Android wrapper

Capacitor 6 (`@capacitor/core|cli|android ^6.1.2` + haptics plugin), in a
`capacitor-app/` folder, with
`capacitor.config.json`: `{"appId":"com.bogusia.pilematch","appName":"Bogusia","webDir":"www","server":{"androidScheme":"https"}}`.
Build pipeline script: copy `index.html` + `manifest.json` + `tiles/` + `sounds/`
into `capacitor-app/www/` → `npm install` → `npx cap sync android` → `gradlew assembleDebug`.
Toolchain: **JDK 17** (AGP 8 fails on 11), Android SDK platform 34 + build-tools
34.0.0, Node 18+. Low-RAM safety in `android/gradle.properties`:
`-Xmx768m`, `org.gradle.daemon=false`, `org.gradle.workers.max=1` — otherwise the
daemon gets OOM-killed. Debug-signed APK that installs over previous debug builds.

Repo layout: `bogusia-web/` (master source) + `capacitor-app/` (wrapper) +
`bootstrap.sh` / `build-apk.sh` + docs (`README.md`, `RESTORE.md`, `PROMPT.md`,
`BUILD_APK.md`) + MIT `LICENSE` + `.gitignore` (node_modules, www/, *.apk).

Also write a `bootstrap.sh` that re-downloads JDK/SDK if missing, self-heals dropped
asset folders, runs the build, and copies the result to a version-named APK
(`Bogusia-v<ver>-debug.apk`, version read from the title), because this sandbox drops
large folders between sessions.

### Workflow rules (important!)

1. **Every change → bump version + recompile APK + update the browser-preview copy.**
   Version lives in `<title>` AND in both locales’ `legal`/`settingsNote` strings.
2. Master source of truth: `bogusia-web/index.html`; keep a byte-identical preview
   mirror and let the build script sync the Capacitor `www/`.
3. Never regress the constraints above (tile size, strict bar, structure rules,
   audio rules) — they are deliberate decisions, not accidents.
4. After edits, grep-verify the file — this environment has silently reverted edits
   before.

When done: build the APK, list its contents to prove fresh assets are inside, and
give me install/run instructions for both the APK and the browser version.

---

*End of prompt. Adjust the structure pool, tile sets, or languages as you like —
but keep the “sacred constraints” (84×110 tiles, strict Hold-5, ≥50% ground fill,
human voices, quiet music) unless Bogusia says otherwise.* 🙂
