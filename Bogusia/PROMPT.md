# PROMPT.md — rebuild Bogusia / Pile Match from scratch

> Paste the prompt below into an AI coding agent (e.g. Arena.ai Agent Mode) with an
> empty workspace and it will recreate this project. It encodes the full spec plus
> every constraint learned over versions up to v4.47 — including the mistakes to avoid.

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

**Hold 5 (Pasek 5)** — the signature mode:

- Tapped tiles **fly into a holding bar of 5 pockets** (smooth flight animation,
  natural tile size ending at `scale(0.72)` in the pocket, **no rotation**; dot-style
  faces must not re-flow mid-flight — render the ghost at natural tile size).
- Two identical tiles in the bar vanish automatically (scale-out 0.72→0.8→0).
- **STRICT RULE: all 5 pockets full with no pair = game over.** No rescue by a
  matching board tile — that escape hatch existed once and was deliberately removed.
  Bar-full dialog is one short sentence + undo/shuffle buttons.
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
- each generator has a `.disp` display name; with debug mode on, show
  “🏗 name • N tiles” top-left during Hold-5
- no negative x coordinates (rendering starts at x=0)

Initial pool (all must satisfy the rules above):
twin side pyramids + flat 1-level middle field (46 tiles, 3 layers) · little towers
on 4 corners + 1 in the middle, rest flat (46, 4) · four zigzag towers + middle mound
(56, 6) · wide vertical ridge low at the ends/tall mid with side wings (62, 5) ·
3-column skyscraper narrowing every two floors (50, 6) · portrait castle keep with
3-wide walls (48, 4).

### Scoring

Per matched pair: `mult = 1 + clamp((10−Δt)/5, 0, 2)` (up to 3× speed bonus);
streak increments when Δt ≤ 5 s; **streak bonus only from streak ≥ 4**:
`min(25, (streak−3)×5)`; points = `round(10×mult) + bonus`. Fire voice + on-screen
fire effect trigger with the streak bonus.

Penalties (both reset the streak and show a red "−N" bubble): shuffle costs
`min(60, 10 + 8×uses + ⌈pairsLeft/3⌉)`; **undo costs points** — `12 + 6×uses`
capped at 34 in Classic, `18 + 6×uses` capped at 40 in Hold-5 (pricier there,
since undo is the only rescue from a full bar).

### Audio (recorded MP3 files in `sounds/`)

- **“Fire!” / “Ogień!” streak voice**: natural-sounding recorded clips
  (1 EN clip, 5 PL clips mixing masculine/feminine). Rules: random pick that
  **never repeats the previous clip**, **8-second global throttle**, human TTS only
  as fallback if files are missing.
- **Background music (Hold-5 only)**: 2 tracks in an **alternating** loop (never the
  same track twice in a row), fade-in ~800 ms on start, fade-out on win/exit, and
  **each playback starts at a random point 0–40 s** in. Music volume slider default
  25 where **slider 100% = 0.55 actual loudness** — music stays in the background.
- UI click/match sounds behind a master volume slider (default 70) and a sound
  toggle; vibration via Capacitor Haptics with `navigator.vibrate` fallback.

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
