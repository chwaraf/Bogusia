# 🀄 Bogusia — Pile Match

A senior-friendly mahjong-solitaire-style **pair-matching game** with two game modes,
English/Polish localization, recorded sound effects, and background music — built as a
**single-file HTML5 game** and shipped as an **Android APK** via Capacitor 6.

**Version v4.47** · App ID `com.bogusia.pilematch` · License: [MIT](LICENSE) ·
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
| **Hold 5** (Pasek 5) | `'bar5'` | Tapped tiles fly into a **holding bar with 5 pockets**. Two identical tiles in the bar vanish automatically. **If all 5 pockets fill with non-matching tiles — game over** (strict; there is no rescue move). Undo/shuffle are your escape. |

Hold-5 differences vs Classic:

- **Free rule is relaxed:** a tile is blocked only when **covered from above** (0.9
  tolerance); there is **no left/right side-block** check.
- Board always uses a **Structure** layout (see below).
- **Background music** plays (Classic has none).
- **Auto-zoom is capped at 1.0** so tiles are always exactly the same size as Classic
  (84×110 px). Classic may zoom up to 1.8×.
- Toolbar hint/undo/shuffle all work the same.

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

### Structures (Hold-5 generator pool, `STRUCTURE_GENS`)

Each new Hold-5 game picks **one random composition** from 6 generators. Every
structure is guaranteed by automated tests to be: even tile count, **44–80 tiles**,
no duplicate positions, **fully supported** (nothing floats), **fully drainable**
(can always be cleared), **≥ 50% ground coverage** of its bounding box, and
**≥ 3 columns wide**.

| Generator | Display name | Tiles / Layers | Ground fill | Description |
|---|---|---|---|---|
| `structTwinPyramidField` | twin pyramids + flat field | 46 / 3 | 86% | two vertical side pyramids with a 1-level field between them |
| `structCornerTowersField` | corner towers + middle tower | 46 / 4 | 100% | little towers on all 4 corners + one in the middle, rest flat (Bogusia's own spec) |
| `structQuadTowersMound` | quad towers + middle mound | 56 / 6 | 57% | four zigzag towers + central mound |
| `structRidgeWide` | wide vertical ridge | 62 / 5 | 92% | low at both ends, tallest in the middle, side wings added |
| `structSkyscraperCity` | 3-column skyscraper | 50 / 6 | 100% | high-rise that narrows every two floors |
| `structCastleKeepWide` | castle keep (3-wide) | 48 / 4 | 100% | portrait castle with 3-wide walls |

> 🔍 **Debug mode** (Settings → 🔍 Debug) shows the arrangement name + tile count
> top-left during Hold-5 games (`#debug-structure`), plus free/blocked overlays.

## Tile sets

13 selectable sets (`Settings → 🎨 Tile set`) or 🎲 random-per-game:

`food`, `geometric`, `minecraft`, `foodblock`, `geoblock`, `mcblock`, `mine13`,
`mine14`, `riichi`, `riichidark`, `default`, `def2`, `def3`

- Most sets are **6×6 sprite sheets**; others are single PNG blocks or dot/emoji sets.
- **Riichi sheets** (`riichi_sheet.png`, `riichi_dark_sheet.png`, 720×960 px = 6×6
  cells of 120×160): cells **31 and 34 are blank tiles, 35 is the tile back** — the
  game filters them out (`TILE_DEFS.filter(d => d.id!==31 && d.id!==34 && d.id!==35)`),
  leaving **33 playable faces**. Never use `slice(0,34)` here — that was the blank-tile bug.
- Tile size is **locked at 84×110 px** (`--tile-w`/`--tile-h`) for every mode; bar
  pocket tiles are the same tiles at `scale(0.72)`.

## Audio

All files in `sounds/` (MP3), synced into the APK by the build script.

| File(s) | Purpose | Rules |
|---|---|---|
| `fire-en.mp3` | “Fire!” streak-bonus voice (EN) | plays on streak bonus; **8 s throttle**; **never the same clip twice in a row** (`fireClipLastIdx`); natural recorded voice, TTS only as fallback |
| `fire-pl-1.mp3` … `fire-pl-5.mp3` | “Ogień!” variants (PL) — 3 masculine + 2 feminine | same rules; random pick from the pool of 5 |
| `congrats-pl*.mp3`, `congrats-en*.mp3` (8) | Hold-5 win congratulations by rank: Gratulacje / top-10 / top-3 / 1st place | recorded male voices (like fire clips), play once per win, TTS fallback |
| *(synthesized, no file)* | 1st-place **fanfare** (~2 s) + falling golden confetti | WebAudio brass arpeggio+chord; 90 gold DOM pieces; respects sound/animation toggles |
| `mahjong_background.mp3`, `mahjong2.mp3` | Hold-5 background music | **alternating loop** (never same track twice), fade-in 800 ms / fade-out on win or leave, **random start point 0–40 s**, plays in Hold-5 only |

- Music volume slider default **25**; slider 100% = old 0.55 loudness (`musicTargetVol() = slider × 0.55`).
- **Hold-5 win dialog**: shows score + place (`miejsce X z Y`) with tier voice — “Gratulacje!” (any win), “Szczere gratulacje!” (top 10), “Super gratulacje!” (top 3), “Mistrzostwo!” (#1 → fanfare + confetti). Two buttons only: ▶ New game / 🏠 Start screen.
- Fire bonus is awarded **less often** than classic streaking: streak threshold is **≥ 4** (`streakBonus = streak≥4 ? min(25, (streak−3)×5) : 0`).
- UI sounds respect the master volume + sound toggle; vibration uses Capacitor Haptics with `navigator.vibrate` fallback (`vib()`).

## Scoring

`computeMatchPts()` per matched pair:

```
mult  = 1 + clamp((10 − Δt)/5, 0, 2)    // speed multiplier, up to 3× (Δt = seconds since last match)
streak  increments when Δt ≤ 5 s, else resets to 1
bonus = streak ≥ 4 ? min(25, (streak−3)×5) : 0
points = round(10 × mult) + bonus
```

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
| `pm_musicvol` | music volume | 25 |
| `pm_sound` | sounds on/off | 1 |
| `pm_vib` | vibration | 1 |
| `pm_anim` | bubble animations | 1 |
| `pm_debug` | debug overlay | 0 |
| `pm_textureSet` | chosen tile set | `food` |
| `pm_randomTexture` | random set per game | 0 |
| `pm_badges` | ✔/🔒 free marks on tiles | 0 |
| `pm_mode` | `classic` / `bar5` | `classic` |
| `pm_layout` | last classic layout | — |
| `pm_results` | saved results (split per mode via `mode` field) | [] |
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

Run this suite **after any generator change** before building the APK. A new shape =
one generator function + `.disp` name + entry in `STRUCTURE_GENS`.

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
6. **Music stays in the background:** low volume (slider 100% = old 55%), fades
   in/out, two alternating tracks, random start 0–40 s, Hold-5 only.
7. **Fire bonus is earned:** streak ≥ 4 before bonus points and the voice trigger.
8. **Riichi sprite sheets:** skip cells 31/34 (blank) and 35 (back) — 33 faces only.
9. **Bar pockets** render mini tiles at `scale(0.72)`; flight animations land
   un-rotated, natural size, and never re-flow dot-style faces.
10. **Bilingual everything:** every user-visible string exists in EN and PL.

## Version history

| Version | Highlights |
|---|---|
| **v4.47** | Results split per mode (Classic/Hold-5 tabs, mode-aware replay & clear); Hold-5 win dialog v2 — score + place, ranked recorded voices (top10/top3/#1), fanfare + golden confetti for #1, buttons = New game / Start screen; **undo penalty** (escalating, streak reset, balanced vs shuffle); popups de-wall-texted. |
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
