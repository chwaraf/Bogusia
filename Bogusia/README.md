# 🀄 Bogusia — Pile Match

A senior-friendly mahjong-solitaire-style **pair-matching game** with two game modes,
English/Polish localization, recorded sound effects, and background music — built as a
**single-file HTML5 game** and shipped as an **Android APK** via Capacitor 6.

**Version v4.55** · App ID `com.bogusia.pilematch` · License: [MIT](LICENSE) ·
Made with ❤️ for Bogusia

---

## 🚀 Quick start

| I want to… | Do this |
|---|---|
| **Play in a browser** | Open [`bogusia-web/index.html`](bogusia-web/index.html) — it's fully self-contained (game + tiles + sounds), no server or install needed |
| **Install on Android** | Grab the latest `Bogusia-vX.YY-debug.apk` from **[Releases](../../releases)** — debug-signed, installs over older versions |
| **Build the APK myself** | See [BUILD_APK.md](BUILD_APK.md) — one script, JDK 17 + Android SDK 34 |
| **Work on it in Arena.ai** | See [RESTORE.md](RESTORE.md) — recover the full workspace after a wipe, in ~10 min |
| **Rebuild the game from scratch** | Feed [PROMPT.md](PROMPT.md) to an AI coding agent — full spec + hard-won constraints |

## 📚 Documentation map

| File | What it's for |
|---|---|
| **README.md** | this file — game reference: rules, structures, audio, scoring, settings |
| [RESTORE.md](RESTORE.md) | recover the project on Arena.ai from GitHub after a workspace wipe; modify + push workflow |
| [PROMPT.md](PROMPT.md) | complete from-scratch regeneration prompt (design spec up to v4.46) |
| [BUILD_APK.md](BUILD_APK.md) | manual APK build on your own PC/Mac (incl. Windows steps) |
| [LICENSE](LICENSE) | MIT — free public license |

---

## The game

A pile of mahjong-style tiles is stacked in layers. Tap two identical **free** tiles to
remove them. Clear the whole pile to win. Designed for a senior player (Bogusia 👩):
big tiles, high contrast, large buttons, gentle animations, Polish UI, and forgiving
assists (hint, undo, shuffle).

Everything lives in **one file** (`bogusia-web/index.html`, ~113 KB) — markup, CSS and
JavaScript inline, no frameworks, no build step for the game itself. Tile artwork is
PNG sprite sheets in `tiles/`, audio clips are MP3s in `sounds/`.

## Game modes

| Mode | `settings.mode` | Rule |
|---|---|---|
| **Classic** (Klasyczny) | `'classic'` | Standard mahjong-solitaire removal from the board; tap two free matching tiles. |
| **Hold 5** (Pasek 5) — **default mode** | `'bar5'` | Tapped tiles fly into a **holding bar with 5 pockets**. Two identical tiles in the bar vanish automatically. **If all 5 pockets fill with non-matching tiles — game over** (strict; there is no rescue move). Undo/shuffle are your escape. |

Hold-5 differences vs Classic:

- **Free rule is relaxed:** a tile is blocked only when **covered from above** (0.9
  tolerance); there is **no left/right side-block** check.
- Board always uses a **Structure** layout (see below).
- **Background music** plays (Classic has none).
- **Auto-zoom is capped at 1.0** so tiles are always exactly the same size as Classic
  (84×110 px). Classic may zoom up to 1.8×.
- Toolbar hint/undo/shuffle all work the same.
- Tapped tiles fly to their pocket with a gentle **360° spin**.
- **Bar-full Shuffle actually helps** — it first returns the newest bar tile (freeing a
  pocket, one undo penalty), then reshuffles the board. Previously it could loop the
  "bar full" prompt forever, since reshuffling the board can't empty pockets.

## Layouts & structures

### Classic layouts (`LAYOUTS`)

| Key | Name (EN / PL) | Tiles |
|---|---|---|
| `easy` | Easy 72 / Łatwy 72 | 72 |
| `medium` | Medium 112 / Średni 112 | 112 |
| `hard` | Turtle 144 / Żółw 144 | 144 |
| `senior` | Senior 72 | 72 |
| `bricks` | Bricks 74 / Cegły 74 | 74 |
| `scatter` | **Structures / Konstrukcje** | 44–80 (random composition) — also the forced layout for Hold-5 |

### Structures — the 10-level Hold-5 climb (`LEVEL_POOLS`, 3 builds per level)

Hold-5 is a **level progression**: **10 levels, each a pool of 3 different builds
drawn at random per deal** (30 structures total). Every build fits a **6×6 box** —
nothing ever needs panning on a phone. Levels run **easy → hard by measured
Monte-Carlo difficulty** (`tests/analyze-structures.mjs`: avg bar-fulls per pair +
steady bar pressure). You start at level 1; **beating the highest unlocked level
unlocks the next one** (`pm_h5level`), and the win dialog announces it. The start
screen shows `Poziom N / 10 • ★… • 🎲×3` with tiny ◀ ▶ arrows to replay any unlocked
level (`pm_h5sel`); the footer shows level + stars in-game. Classic mode still picks
one random composition from the **same 30-build pool** (with per-build weights).

Every structure is guaranteed by automated tests to be: even tile count, **44–80 tiles**,
no duplicate positions, **fully supported** (nothing floats), **fully drainable**,
**≥ 50% ground coverage** of its bounding box, **3–6 columns wide**, and the **whole
build — every layer — inside a 6×6 footprint** (v4.55).

| Level | Pool — 🎲 one build drawn at random (EN / PL) | Tiles | ★ | Weight | Measured difficulty (avg diffB: bar-fulls/pair + pressure) |
|---|---|---|---|---|---|
| 1 | honeycomb / plaster miodu · mini donut ring / mini obręcz · micro bridges / mikro mosty | 48–54 | ★ | 0.80 | .026 |
| 2 | meadow + caps / łąka z czapkami · micro terraces / mikro tarasy · sender tower / wieża nadawcza | 44–66 | ★ | 0.80 | .027 |
| 3 | mini canyon / mini kanion · twin rails / podwójne tory · four garden beds / cztery grządki | 52–60 | ★★ | 0.80 | .029 |
| 4 | picnic benches / ławki piknikowe · courtyard walls / mury dziedzińca · mini checker + caps / mini szachownica | 46–48 | ★★ | 0.80 | .031 |
| 5 | mini windmill / mini wiatrak · four keeps + mound / cztery donżony · crown table / stół z koroną | 48–76 | ★★★ | 0.80 | .036 |
| 6 | crush plate / prasowana płyta · volcano / wulkan · zigzag posts / słupki zygzak | 48–62 | ★★★ | 0.80 | .039 |
| 7 | four towers + caps / cztery wieże · twin mounds / dwa pagórki · concentric offset rings / pierścienie | 46–72 | ★★★★ | 0.80 | .049 |
| 8 | great wall micro / mikro wielki mur · twin chimneys mini / dwa kominiki · pagoda plate / płyta pagody | 44–72 | ★★★★ | 0.92 | .061 |
| 9 | micro ziggurat / mikro ziggurat · twin pagodas / bliźniacze pagody · mini keep / mini donżon | 54–58 | ★★★★★ | 1.25 | .084 |
| 10 | deep spire / głęboka iglica · 3-column skyscraper / drapacz chmur · narrow bell tower / wysoka wieża | 50–58 | ★★★★★ | 1.25 | .280 |

Most v4.54 favourites were **rearranged into the 6×6 box** (windmill, canyon, great
wall, concentric rings, ziggurat, chimneys, donut…); new in v4.55: picnic benches,
garden beds, twin rails, courtyard walls, honeycomb, volcano, crush plate, sender
tower, deep spire, four keeps + mound. Scoring: Hold-5 uses the **tier weight**
(`LEVEL_META`), Classic the per-build weight — so every level pays fairly regardless
of which build the dice picked.

> 🔍 **Debug mode** (Settings → 🔍 Debug) shows the level + arrangement name + tile count + ★
> top-left during Hold-5 games (`#debug-structure`), plus free/blocked overlays.

## Tile sets

14 selectable sets (`Settings → 🎨 Tile set`) or 🎲 random-per-game:

`hd36` (**Mahjong HD — default**), `food`, `geometric`, `minecraft`, `foodblock`,
`geoblock`, `mcblock`, `mine13`, `mine14`, `riichi`, `riichidark`, `default`, `def2`, `def3`

- **Mahjong HD** (`hd36`): 36 individual 240×320 riichi tiles in `tiles/hd36/` —
  9 Man + 9 Pin + 9 Sou, 4 winds, 2 dragons, and **3 red fives** which are
  *distinct matching faces* (red 5 does not match plain 5).

- Most sets are **6×6 sprite sheets**; others are single PNG blocks or dot/emoji sets.
- **Riichi sheets** (`riichi_sheet.png`, `riichi_dark_sheet.png`, 720×960 px = 6×6
  cells of 120×160): cells **31 and 34 are blank tiles, 35 is the tile back** — the
  game filters them out (`TILE_DEFS.filter(d => d.id!==31 && d.id!==34 && d.id!==35)`),
  leaving **33 playable faces**. Never use `slice(0,34)` here — that was the blank-tile bug.
- Tile size is **locked at 84×110 px** (`--tile-w`/`--tile-h`) for every mode; bar
  pocket tiles are the same tiles at `scale(0.72)`.

## Intro (v4.53, refreshed v4.55)

On every launch a ~4 s **Shrek-style intro** plays before the start prompt (tap to skip):
grandma with glasses on her cottage couch → over-shoulder view of her playing mahjong on
her phone → **grandma's human hands holding the phone with the REAL in-game screenshot
on it** (PIL perspective-composited from an actual Pile Match capture) — and a golden
**Witaj! / Welcome!** appears: grandma’s game becomes yours. Three frames
(`intro/intro-1..3.jpg`) cross-fade with Ken-Burns zooms; the greeting is real overlaid
text (gold, `I18N.introWelcome`).

## UI chrome (v4.52)

- The old **top header is gone**: time • pairs left live in the **bottom bar**, joined by
  **level + ★ difficulty** in Hold-5 (compact 2-line stat block, no extra height).
- Zoom **+/− buttons removed** from the bottom bar — only the **⤧ reset-to-fit** button
  stays (pinch zoom still works).
- Start screen = **one big ▶ Start button** (+ level line in Hold-5) with a smaller
  **⚙ Settings button below that drops the options panel down** (language, mode, layout, tile set).
  The start card **floats over the in-game forest** — nearly sharp now (`blur(1px)` +
  brightness 0.8, v4.55; it used to sit on a 10px-blurred dim backdrop).
- The Hold-5 bar is now **floating marble** (v4.53): it hovers above the board — the old full-width
  band is gone, speckles replaced by smooth marble veins, and **stones sit above the slab**
  (overflow visible + drop shadows).
- **Drag & drop onto the bar** (v4.53, v4.54 ghost): the dragged stone is a **fixed-position
  ghost that renders above the marble bar** — never behind it; the auto-sorted target pocket
  **glows gold**, drop to place (the flight starts right where you let go). Tap-to-pick works as before.
- **The pile never hides under the bar** (v4.54): fit & pan clamping reserve the bar zone
  (`boardTopInset()`), and stones are **never smaller than the bar pockets** (Hold-5 fit scale
  floor 0.762 = 64/84 px; the widest builds invite a gentle pan).
- Hint button label is **Porada** in PL (short); FIRE!/OGIEŃ! is now **BRAVO!/BRAWO!** (voice + text).

## Audio

All files in `sounds/` (MP3), synced into the APK by the build script.

| File(s) | Purpose | Rules |
|---|---|---|
| `fire-en.mp3` | “Bravo!” streak-bonus voice (EN) | plays on streak bonus; **8 s throttle**; **never the same clip twice in a row** (`fireClipLastIdx`); natural recorded voice, TTS only as fallback |
| `fire-pl-1.mp3` … `fire-pl-5.mp3` | “Brawo!” variants (PL) — 3 masculine + 2 feminine | same rules; random pick from the pool of 5 |
| `congrats-pl*.mp3`, `congrats-en*.mp3` (8) | Hold-5 win congratulations by rank: Gratulacje / top-10 / top-3 / 1st place | recorded male voices (like fire clips), play once per win, TTS fallback |
| `mahjong_background.mp3`, `mahjong2.mp3` | Hold-5 background music | **alternating loop with 1.3 s crossfade** between tracks, gentle 2.6 s fade-in on start, fade-out on win/leave, **random start point 0–40 s**, Hold-5 only |
| `rain-loop.ogg`, `birds-loop.mp3` (real recordings, CC BY-SA — see `sounds/CREDITS.md`) | 🌧 **Ambience** — gentle rainfall + woodland birdsong loops | own 🌧 slider (default 8) with an **on/off checkbox**, mixed at **70% of the music range** (rain ×0.9, birds ×0.55), slow 2.5–3.5 s fade-ins, Hold-5 only |
| *(synthesized, no file)* | **Pentatonic match chime** | each cleared pair plays the next soft wooden note (C-D-E-G-A…), ladder resets after a 6 s pause |
| *(synthesized, no file)* | 1st-place **fanfare** (~2 s) + falling golden confetti | also 7-petal golden drift FX on every vanishing pair (respects the bubbles toggle) |

Visual: Hold-5 plays over a **rainy-forest photo** (`bg-ambient.jpg`,
`blur(2.5px) brightness(0.74)` behind the board — sharpened in v4.52) — visible but never hurting tile readability.

- Music volume slider default **13**, ambience **8** — both sliders have their own **checkbox** (mute the channel without losing the slider value); slider 100% = old 0.55 loudness (`musicTargetVol() = slider × 0.55`). Effects volume has a checkbox too.
- **Hold-5 win dialog**: shows score + place (`miejsce X z Y`) with tier voice — “Gratulacje!” (any win), “Szczere gratulacje!” (top 10), “Super gratulacje!” (top 3), “Mistrzostwo!” (#1 → fanfare + confetti). Two buttons only: ▶ New game / 🏠 Start screen.
- Bravo bonus is awarded **less often** than classic streaking: streak threshold is **≥ 4** (`streakBonus = streak≥4 ? min(25, (streak−3)×5) : 0`).
- UI sounds respect the master volume + sound toggle; vibration uses Capacitor Haptics with `navigator.vibrate` fallback (`vib()`).

## Scoring

`computeMatchPts()` per matched pair:

```
mult  = 1 + clamp((10 − Δt)/5, 0, 2)    // speed multiplier, up to 3× (Δt = seconds since last match)
streak  increments when Δt ≤ 5 s, else resets to 1
bonus = streak ≥ 4 ? min(25, (streak−3)×5) : 0
points = round(10 × mult × structureWeight) + bonus
```
(structureWeight = 0.80–1.25, per Hold-5 structure difficulty — see the ladder above; v4.51)

Penalties (both reset your streak and spawn a red “−N” bubble):

| Action | Cost (escalating per use) | Cap |
|---|---|---|
| 🔀 Shuffle | `10 + 8×uses + ⌈pairsLeft/3⌉` | 60 |
| ↩ Undo — Classic | `12 + 6×uses` (12, 18, 24…) | 34 |
| ↩ Undo — Hold 5 | `18 + 6×uses` (18, 24, 30…) — undo is the only bar rescue there | 40 |

Results are saved locally (`pm_results`) and **split per mode** — the Results dialog has
🧩 Classic / 🖐 Hold 5 tabs (records carry `mode`; pre-v4.47 records count as Classic).
Sorted by score; tapping a result replays that layout in its own mode (auto-switches mode
if needed). 🗑 Clear wipes only the visible tab's list.

## Settings & persistence

All settings live in `localStorage`:

| Key | Meaning | Default |
|---|---|---|
| `pm_vol` | effects volume | 70 |
| `pm_musicvol` | music volume | 13 |
| `pm_volen` / `pm_musen` / `pm_amben` | effects / music / ambience on-off checkboxes | 1 |
| `pm_h5level` / `pm_h5sel` | highest unlocked Hold-5 level / selected level | 1 |
| `pm_ambvol` | ambience (rain+birds) volume | 8 |
| `pm_sound` | sounds on/off | 1 |
| `pm_vib` | vibration | 1 |
| `pm_anim` | bubble animations | 1 |
| `pm_debug` | debug overlay | 0 |
| `pm_textureSet` | chosen tile set | `hd36` |
| `pm_randomTexture` | random set per game | 0 |
| `pm_badges` | ✔/🔒 free marks on tiles | 0 |
| `pm_mode` | `classic` / `bar5` | `bar5` |
| `pm_layout` | last classic layout | — |
| `pm_results` | saved results (split per mode via `mode` field; records also carry `level`) | [] |
| `pilematch_lang` | `en` / `pl` UI language | from `navigator.language` |
| `pilematch_tester` | tester name | `Guest` / `Bogusia` |

## Localization

Full EN + PL in the `I18N` object; `currentLang` auto-detects Polish browsers
(`navigator.language.startsWith('pl')`), switchable in the header. **When adding or
changing a user-visible string, update BOTH `I18N.en` and `I18N.pl`** — including the
version strings `legal` and `settingsNote` (see workflow below).

## Repository structure

```
Bogusia/                         ← this repo
├── README.md                    ← this file
├── RESTORE.md                   ← recover from GitHub onto Arena.ai after a wipe
├── PROMPT.md                    ← from-scratch regeneration spec
├── BUILD_APK.md                 ← manual APK build on your own machine
├── LICENSE                      ← MIT
├── .gitignore                   ← keeps node_modules, www/, APKs out of git
├── bootstrap.sh                 ← self-healing one-command build (Arena sandbox)
├── build-apk.sh                 ← web→www sync + cap sync + gradle
├── bogusia-web/                 ← ★ MASTER GAME SOURCE — edit here ★
│   ├── index.html                   (the whole game, single file)
│   ├── manifest.json
│   ├── bg-ambient.jpg              (blurred forest backdrop for Hold-5)
│   ├── tiles/                       (17 PNGs: sprite sheets & blocks)
│   └── sounds/                      (16 MP3s: 6 fire + 8 congrats voices + 2 music)
└── capacitor-app/               ← Capacitor 6 Android wrapper
    ├── capacitor.config.json        appId com.bogusia.pilematch, webDir www
    ├── package.json                 @capacitor/* 6.1.2 + haptics
    ├── www/                         (generated at build time — gitignored)
    └── android/                     Gradle 8.2.1 wrapper project
        └── gradle.properties        OOM-tuned: -Xmx768m, daemon off, 1 worker
```

**Source-of-truth rule:** `bogusia-web/` is the master. `capacitor-app/www/` is a
build artifact regenerated by the scripts — never edit it. (On the Arena sandbox a
`~/bogusia-play/` browser-preview mirror and the workspace-level `~/bootstrap.sh`
also exist; they're workspace extras, not repo files — see RESTORE.md.)

## Development workflow

> **House rule: every change → new compiled APK + updated preview.** No exceptions.
>
> 🆘 **Workspace got wiped? Everything is recoverable from GitHub — follow
> [RESTORE.md](RESTORE.md).**

1. **Edit the master** `bogusia-web/index.html`.
2. **Bump the version** in three places, both locales:
   - `<title>Pile Match vX.YY …</title>`
   - `I18N.en.legal` + `I18N.pl.legal`
   - `I18N.en.settingsNote` + `I18N.pl.settingsNote`
3. **Sync the preview:** keep the browser copy identical (on Arena: `~/bogusia-play/`,
   plus any new/changed `tiles/` or `sounds/`).
4. **Build the APK:** `bash bootstrap.sh` (Arena, self-healing) or
   `bash build-apk.sh` (own machine — see BUILD_APK.md).
5. **Verify:** unzip-list the APK to confirm fresh assets landed
   (`assets/public/index.html`, `assets/public/sounds/*`).
6. Name the result `Bogusia-vX.YY-debug.apk`, delete/replace the previous one.
7. **Grep-verify every edit landed** — Arena workspace snapshots have silently
   reverted/spliced file content mid-session before.
8. **Update the docs with the code** (same sitting): README (incl. a Version-history
   row), PROMPT.md if the spec changed, RESTORE.md if the workflow changed.
9. **Commit & push at the end of every sitting** so the repo never lags behind:
   `git add -A && git commit -m "vX.YY: …" && git push origin main`
   (credentials + conflict rules: RESTORE.md step 5). Publish APKs by attaching them
   to a **GitHub Release** — never commit binaries.

## Building the APK

- **Arena.ai sandbox (one command, self-healing):**
  ```bash
  bash bootstrap.sh            # downloads JDK 17 + Android SDK 34 on demand, then builds
  bash bootstrap.sh --check    # status report only
  ```
  Cold start ~5–8 min, warm ~1–2 min. Output: `~/Bogusia-v<version>-debug.apk`.
  The downloaded `toolchain/` (~110 MB) is safe to delete between builds.
- **Your own machine:** install JDK 17 (not 11 — AGP 8.x requires 17), Node 18+,
  Android SDK 34, then `bash build-apk.sh`. Full steps incl. Windows:
  [BUILD_APK.md](BUILD_APK.md).

### Known build gotchas (already worked around)

- **OOM:** with ~2 GB RAM the Gradle daemon gets killed. `capacitor-app/android/gradle.properties`
  sets `org.gradle.jvmargs=-Xmx768m`, `org.gradle.daemon=false`,
  `org.gradle.workers.max=1`. Don't “upgrade” these back.
- **`pkill -f gradle` kills your own shell** (pattern matches its own cmdline) — use
  `pkill -9 -x java`.
- **Snapshot drift (Arena):** `node_modules/`, `build/`, `.gradle/` are never persisted;
  big folders get dropped silently; verify with grep, let bootstrap self-heal.

## Testing structures

The 6 generators sit between `// === STRUCTURES-BEGIN/END ===` markers in
`index.html`, so they can be extracted and run under Node:

```bash
# extract the section, then assert for every generator:
#   even tile count · 44–80 range · no duplicate (x,y,z)
#   every tile supported from below · fully drainable by the free rule
#   ground coverage ≥ 50% of bounding box · width ≥ 3 columns
```

Run `node tests/analyze-structures.mjs [deals] [seed]` **after any generator change**
before building the APK. A new shape = one generator function + `.disp`/`.diff`/`.stars`
+ entry in `STRUCTURE_GENS`.

### Monte-Carlo difficulty analyzer (v4.51)

`tests/analyze-structures.mjs` does both jobs: the static asserts above **and** a
Monte-Carlo playout — N random deals per structure per mode, played with the game's
real rules (classic side-block vs bar5 top-only; faces dealt in 4-copy groups over 36
types; classic = random free pair with shuffle-on-deadlock; bar5 = greedy
complete-a-bar-pair with undo+shuffle on bar-full). It reports win rate, deadlocks /
bar-fulls, average bar pressure, solution length and type diversity, then derives:

- **★ difficulty (1–5)** per structure (quintile inside the pool) — shown in the
  debug tag next to the structure name
- **scoring weight** (`g.diff`, clamped 0.80–1.25) — multiplies the speed component
  of match points

Measured values (400 deals, seed 42): skyscraper ★5 (w1.25) > quad towers ★5 (w1.25)
> castle ★4 (w0.92) > ridge ★3 (w0.80) > twin pyramids ★2 (w0.80) > corner towers ★1
(w0.80). Note: with dealt-4-copy faces, type diversity is ~constant — difficulty is
driven by blocking, not face variety.

## Design rules & hard-won constraints

These come from direct user feedback — treat them as **requirements**, not suggestions:

1. **Tile size is sacred:** exactly 84×110 px, **identical in Classic and Hold-5,
   in every game**. Hold-5 auto-zoom is therefore capped at 1.0 (`fitAndCenter`:
   `settings.mode==='bar5' ? 1 : 1.8`).
2. **Senior-friendly first:** big tiles/buttons, high contrast, readable fonts,
   gentle animations, no tiny fiddly UI.
3. **Structures:** 44–80 tiles, even count, min width 3 columns, **ground must fill
   ≥ 50%** of the bounding box — no skinny 2-column rails, no scattered 3-pyramid
   deserts. Fully supported and always drainable.
4. **Hold-5 is strict:** 5 filled pockets with no pair = game over. No rescue path
   (removed v4.38); pairs that land together still vanish before the check.
5. **Voices must sound human:** recorded MP3 clips only (TTS is just a fallback),
   never the same clip twice in a row, 8-second global throttle.
6. **Music stays in the background:** low volume (slider 100% = old 55%), gentle
   2.6 s fade-in, 1.3 s crossfade between the two alternating tracks, random start
   0–40 s, Hold-5 only; ambience layer has its own slider.
7. **Fire bonus is earned:** streak ≥ 4 before bonus points and the voice trigger.
8. **Riichi sprite sheets:** skip cells 31/34 (blank) and 35 (back) — 33 faces only.
9. **Bar pockets** render mini tiles at `scale(0.72)`; flight animations land
   un-rotated, natural size, and never re-flow dot-style faces.
10. **Bilingual everything:** every user-visible string exists in EN and PL.

## Version history

| Version | Highlights |
|---|---|
| **v4.55** | Intro finale = grandma's **human hands** holding a phone with the **real in-game screenshot** (PIL perspective composite); greeting fixed to **Witaj!**. Start card floats over a **nearly-sharp forest** (1 px blur). **Layout rebuild: everything ≤ 6×6** — the 24-build ladder became **10 levels × 3 random builds (30 structures)**, favourites rearranged into the box + new ones (benches, beds, rails, honeycomb, volcano, crush plate, deep spire); tiers ordered + weights baked from measured diffB; analyzer asserts the 6×6 box on every layer. |
| **v4.54** | Intro composites **real hd36 stones** into grandma’s phone; pile never slides under the floating bar (`boardTopInset` in fit + clampPan); dragged stones fly as ghosts **above the bar**; **stones never smaller than bar pockets** (Hold-5 fit floor 0.762); **ladder 18 → 24** — six new tall, portrait-friendly builds (viaduct, canyon, windmill, crown steps, chimneys, pagoda tower) + early levels re-detailed with half-tile offsets (less dull); bigger golden congrats; **changelog moved out of prompts into Settings → 📋 Changes/Zmiany**. |
| **v4.53** | **Shrek-style animated intro** (grandma → phone zoom → gold Welcome!/Witamy!, tap to skip). Hold-5 bar = **floating marble** (band + speckles removed, stones above the slab) with **drag & drop**: glowing target pocket, drop to place, auto-sort kept. |
| **v4.52** | **Hold-5 level climb** — 18 structures ordered easy→hard by measured Monte-Carlo difficulty; win to unlock the next (start screen ◀ ▶ level picker, footer shows level + ★). Structure pool 6 → 18: checker bumps, donut ring, bridges, terraces, concentric rings, nine towers, stair/little/grand pyramids, great wall, bell tower… UI: top header merged into the bottom bar (time • pairs • level/★), zoom +/− removed (⤧ stays), stone-texture hold bar, sharper forest backdrop (blur 7→2.5 px), super-simple start card (big ▶ Start + collapsible ⚙), Porada button. Audio: defaults music 13% / ambience 8%, per-channel checkboxes (mute without losing slider values). **FIRE!/OGIEŃ! → BRAVO!/BRAWO!** (6 re-recorded clips + on-screen text). |
| **v4.51** | **Mahjong HD set** (36 individual riichi tiles incl. red fives — default set); **Monte-Carlo difficulty analyzer** (`tests/analyze-structures.mjs`) mirroring real rules; structure ★ difficulty in debug tag; scoring weighted by structure difficulty (±20–25%); analyzer also caught & the drain test now uses randomized orders + footprint coverage. |
| **v4.50** | 🔥 Hotfix — a malformed CSS line in v4.49 killed the `#board` rule and pushed all tiles off-screen in both modes; layout restored. New workflow guard: CSS brace-balance check after every style edit. |
| v4.49 | Real recorded ambience (rainfall + birdsong loops, CC BY-SA — `sounds/CREDITS.md`), ambience lowered to 70% of music range, blurred rainy-forest backdrop behind the Hold-5 board. |
| **v4.48** | Relaxation pack: 🌧 rain+birds ambience slider, pentatonic match chimes, petal vanish FX, music crossfade + slower 2.6 s fade-in, 360° pocket spin; bar-full Shuffle now frees a pocket (prompt can't loop); defaults → Hold-5 + Mahjong set. |
| v4.47 | Results split per mode (Classic/Hold-5 tabs, mode-aware replay & clear); Hold-5 win dialog v2 — score + place, ranked recorded voices (top10/top3/#1), fanfare + golden confetti for #1, buttons = New game / Start screen; **undo penalty** (escalating, streak reset, balanced vs shuffle); popups de-wall-texted. |
| v4.46 | Hold-5 zoom locked to natural size; structure pool v2 (6 denser compositions above); debug shows arrangement name. Triple-pyramid removed. |
| v4.45 | Unified 84×110 tiles in both modes; bar mini rescale 0.72; riichi blank cells excluded (33 faces); structures scaled to 44–80. |
| v4.44 | Portrait-first structures (skyscraper, twin towers, ridge, keep…). |
| v4.43 | **Structures feature**: 5 generators + support-prune + Node test harness; `scatter` renamed “Structures/Konstrukcje”; fire threshold streak ≥ 4; random music start 0–40 s. |
| v4.42 | Music loudness ×0.55; fire throttle 4 s → 8 s; fade-in 800 ms; Gradle OOM fix. |
| v4.41 | Hold-5 background music (2 alternating tracks, fades) + music volume slider (default 25). |
| v4.40 | 5 Polish “Ogień!” voice clips with no-repeat picker; bootstrap.sh hardened (asset + .git self-heal). |
| v4.39 | Recorded fire voices replace robotic TTS (with better TTS fallback). |
| v4.38 | flyToBar rewrite (no rotation, natural size, no dot reflow); **strict bar-full game over**. |
| … | Earlier history in the git log. |

## License

[MIT](LICENSE) — free public license: use, modify and share the code and the built
APK freely. If you'd rather require derivatives to stay open-source, swap LICENSE
for GPL-3.0. See `LICENSE` for the asset note (bundled tiles/music).

---

*Built with ❤️ for Bogusia. Powodzenia!*
