# Bogusia (Pile Match) — Build from source → APK

Compiled on 2026-07-31 from `pile-match-project` (= v4.17-final source, verified identical
to `pile-match-project-v4.17-final.zip`).

**Result:** `Bogusia-v4.23.apk` (debug-signed, 11 MB) — built 2026-07-31 (supersedes v4.21/v4.22)
v4.21 changes: badges (✔/🔒) moved to settings toggle (off by default), 3D-mode option removed,
food/geo/mc block-set textures re-composited with even margins + soft blend (built from repo uploads),
bigger/bolder numbers on Default, CSS drop-shadow chains replaced with solid box-shadow slabs (lag fix),
block13/block14 + Mine13/Mine14 sets added. v4.22: tile gaps, drag&return for free tiles, clean food/geo fills. v4.23: Bricks 94 symmetric layout, 4-style number tiles, structured-only-for-texture-sets layering. Earlier artifacts: Bogusia-v4.17-compiled.apk (4.8 MB), Bogusia-v4.2x.apk.
- Package: `com.bogusia.pilematch`  ·  app label: **Bogusia**
- versionName 1.0 / versionCode 1 · minSdk 22 · compiledSdk 34
- Debug signature — fine for sideloading; release keystore needed for Play Store.

## Environment used
- Node.js v20 + npm 10 (already present)
- Temurin JDK 17.0.20 → `/opt/android-build/jdk17` (JDK 11 system-wide is too old for AGP 8)
- Android SDK → `/opt/android-build/sdk` (platform-tools, platforms;android-34, build-tools;34.0.0)

## Rebuild (full, from scratch)
```sh
# 1. Toolchain (run once)
sudo mkdir -p /opt/android-build && sudo chown -R $USER /opt/android-build && cd /opt/android-build
curl -sL -o jdk17.tar.gz "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse"
tar xzf jdk17.tar.gz && mv jdk-17* jdk17
curl -sL -o cmdline-tools.zip "https://dl.google.com/android/repository/commandlinetools-linux-13114758_latest.zip"
unzip -q cmdline-tools.zip && mkdir -p sdk/cmdline-tools/latest && mv cmdline-tools/* sdk/cmdline-tools/latest/
export JAVA_HOME=/opt/android-build/jdk17
export ANDROID_HOME=/opt/android-build/sdk
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
yes | sdkmanager --licenses
sdkmanager --install "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# 2. Build the app
cd /home/user/Bogusia/pile-match-project
npm install
npx cap add android            # already committed now; use `npx cap sync android` on later edits
echo "sdk.dir=/opt/android-build/sdk" > android/local.properties
cd android
GRADLE_USER_HOME=/opt/android-build/gradle ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

For a release build: `./gradlew assembleRelease` after adding a signing config
(see `INSTALL_Bogusia.txt`, Google Play section).

## v4.24 (2026-07-31)
- Custom-block sets (Default, FoodBlock, GeoBlock, MCBlock, mine13, mine14): removed ALL borders/structured layers around tiles — no green free-ring, no double selected-ring (replaced with soft shadow + golden glow); fixed a CSS bug where mine13 tiles were permanently dimmed; free/blocked distinction is now shadow vs. dimming only. Texture sets (Food/Geo/MC) keep their card borders + 3D slab layers.
- New layout "Bricks 94" / "Cegły 94": symmetric stepped wall — 10x6 base, centered 8x4 second layer, centered 2-tile cap (94 tiles, 47 pairs), all layers centered on both axes.
- Default number tiles now match BY NUMBER: red, black and dots-flipped variants of the same number all pair with each other (previously a flipped "5" did not match a normal "5"). Applies to matching, hints, stuck detection and shuffle.
- APK: Bogusia-v4.24.apk (debug-signed, same signature as v4.21+).

## v4.25 (2026-07-31)
- FoodBlock set rebuilt: all 36 icons now fill the tile face evenly — the extraction was falling back to a small fixed crop for objects-on-card icons (pepper mill id=2, menu id=33 and similar), leaving big blank margins; new per-icon detection crops exactly the artwork card, sparse line-art keeps its full card. Slightly smoother upscaling (50% bilinear blend).
- Default number set: red variants removed — all numbers are black again (dot/number flip variety kept, matching still by number).
- Workspace cleaned: old APKs (v4.20–v4.24) and outdated preview images deleted; Bogusia-v4.25.apk is the only/current build (same debug signature e683…40fd).

## v4.26 (2026-07-31)
- Root-cause fix in the block compositor: the perspective-warp coefficient map was built backwards (source→dest instead of dest→source), so every composited texture landed at ~75% size in the upper-left of the face. This was the real reason FoodBlock icons looked small/lost. Rebuilt all affected sheets with the corrected warp — textures now fill the face edge-to-edge.
- FoodBlock rebuilt from the pristine 60×78 mozaika_final cells (previous version extracted icons from the wrong intermediate file, which had mini-art with blank margins). Frame reduced to 12px — icons fill ~85% of the face; menu recipe text is readable.
- GeoBlock + Geometric card set rebuilt from the original 191×236 cards in "geometric tiles.png" (was upscaled 60×78) — noticeably sharper.
- Debug ID option fixed: it had no click handler and did nothing. Now hovering a tile shows a tooltip: set name, tile id, pattern name for geometric sets (all 36 real names), number for the default set, FREE/BLOCKED and x/y/z position.
- APK: Bogusia-v4.26.apk (same debug signature). Old v4.25 APK removed.

## v4.27 (2026-07-31)
- Audit after user report "borders/structured layers on block sets": CSS confirmed clean — borders/slab box-shadows are hard-scoped to the first 3 texture-only sets (Food/Geometric/Minecraft); the rules for Default/FoodBlock/GeoBlock/MCBlock/mine13/mine14 explicitly set border:0 !important and box-shadow:none !important (only soft free-shadow, blocked dim, selected golden glow remain).
- The visible offenders were in the SHEETS, not CSS: (a) GeoBlock: cropping with 1px inset re-introduced the source cards' built-in dark right (~10px) and bottom (~20px on Tetris cards) shadow bands → fake inner border; now cropped with per-edge safe insets (right 14px, bottom 23px) — line gone. (b) MCBlock still used the old compositor pass with a thick inner frame; rebuilt with the corrected warp and a thin 13px frame so it matches the mine13 look.
- GeoBlock/plain Geometric sprite re-cropped with the same safe insets.
- Locked rule: never add borders/rings/structured layers to sets that already contain blocks; textures fill the face, keep only the block's own thin natural frame.
- APK: Bogusia-v4.27.apk (same debug signature). Old v4.26 APK removed.

## v4.28 (2026-07-31)
- Fixed the REAL cause of "borders/structured layers appearing inconsistently on block sets" (after using the Random set option or reopening the app): the CSS body class texture-* was only updated inside applyPerfMode()/saveSettings(), but the Random-option path in genGame() changed settings.textureSet WITHOUT re-applying it. Tiles then rendered one set (e.g. MCBlock) while the body still carried the previous set's class (e.g. minecraft) — so the first-3-sets' scoped rules (gold border + 3D slab box-shadows) were applied onto block tiles. Random per relaunch with the option enabled => inconsistent look. Fix: genGame's random pick now calls applyPerfMode(), so the body class always matches the rendered set. Verified by automated in-page checks over multiple random runs (class-sync OK, no stray box-shadows on block tiles).
- APK: Bogusia-v4.28.apk (same debug signature). Old v4.27 APK removed.

## Portability (2026-07-31)
- pile-match-project/www synced to the current game (v4.28, 11 tile PNGs); machine-specific android/local.properties removed from the clone.
- Turnkey local build: /home/user/build-apk.sh (syncs www from bogusia-web, npm install, cap sync, gradlew assembleDebug) — verified end-to-end (BUILD SUCCESSFUL, APK contains v4.28). Instructions: /home/user/BUILD_APK.md (toolchain: JDK 17, Node 18+, Android SDK platform-tools + platforms;android-34 + build-tools;34.0.0; Windows steps included).

## v4.29 (2026-07-31)
- Sound: AudioContext is now resumed on every beep plus on pointerdown/touchstart/keydown/focus/pageshow and when the app returns from background (visibilitychange) — fixes "sound gone or very quiet" after pausing the app; beep nodes are disconnected after playback; base gain slightly raised (0.28->0.34).
- Default number tiles: removed the strong white glow halo — numbers are plain dark black again and readable at a glance.
- UI icons enlarged: footer buttons 19px icons with 44px+ touch height, header/stats/lang fonts bumped.
- The 5 left footer buttons now have text labels under the icons (Hint/Undo/Shuffle/Layout/Results — PL: Podpowiedź/Cofnij/Tasuj/Układ/Wyniki).
- Full EN/PL pass: previously hardcoded settings rows (Random set, Free marks, Debug info, Tester) are localized; settings note refreshed.
- Bricks layout reduced to 74 tiles (37 pairs): symmetric 8x6 base + centered 6x3 level + centered 4x2 cap — fits the screen neatly.
- Textures/borders/structured layers untouched.
- APK: Bogusia-v4.29.apk (same debug signature). Old v4.28 APK removed.

## v4.30 (2026-07-31)
- **Points system** (per user request):
  - Match = `round(10 × speedMult) + streakBonus`; speedMult = `1 + clamp((10 - dt)/5, 0, 2)` where dt = seconds since last match (instant rematch ≈ ×3 = 30 pts, ≥10 s = ×1). Streak (matches within 5 s) ≥ 3 adds `min(25, (streak-2)×5)` bonus.
  - New score box ⭐ in the **middle of the bottom bar** with count-up animation + scale bump.
  - Flying score FX: on match a gold `+N` chip pops at the pair midpoint (spring overshoot) then ease-ins (gravity) into the score box; shuffle spawns a red `−N` chip from the Shuffle button. WAAPI keyframes, `.score-fx.plus/.minus`.
  - **Shuffle penalty** = `min(60, 10 + 8×(shufflesDone-1) + ceil(tilesLeft/6))` — scales with tiles left and shuffle count; resets streak.
  - Score saved into `pm_results`; win message shows score.
- **Wyniki list** = leaderboard: sorted by score desc, rank medal (#1 gold/#2 silver/#3 bronze) shown **before points**, time/moves demoted to meta line; tapping an entry replays that layout (note updated in both langs).
- **New sets `def2` / `def3`** (white_basic.jpg / white_basic5.jpg attachments): cut out from uniform dark bg (lum thr 72, min/max open-close, 1.2 px feather) to transparent `tiles/def2_block.png` (502×666) / `tiles/def3_block.png` (585×770). Flat 43.9-lum cast-shadow band on right/bottom was excluded on purpose (tiles get drop-shadow in game). Render via same DOM number/dots code as Default (`bgFile` switch), **match-by-number** (`pairKey` extended), added to all 6 borderless block-set CSS groups, random pool, hidden select, debug SET_LABELS.
- **Modern set picker**: `select` hidden, `#set-grid` 3-col card grid (icon + name, active card green + ✓ badge) — `SET_ORDER/SET_ICONS/SET_NAMES`, `buildSetGrid()/syncSetGrid()` (called from applyLang + applyPerfMode so Random rolls stay in sync).
- **i18n fixes**: `label-lang` now "🌐 Language"/"🌐 Język" (was hardcoded Język); settings title "⚙ Settings"/"⚙ Ustawienia" (was "Deluxe"); results title/Close/Clear/note now localized; new keys: langLbl, setLbl, ptsShort, clear, resultsNote; set names localized (Food→Jedzenie, Default→Domyślny etc.).
- **Slimmer bottom bar**: footer buttons 50×44→45×41 px, padding/gaps trimmed (icon 19 px and 9 px labels kept), zoom group slimmer — score box fits the middle.
- Test hook `window.__pm` (state/pairKey/onClick/spawnScoreFx/...) for headless verification.
- Verified via headless Chromium screenshots: def2/def3 boards, real-match +N flight + score 10 in box, EN settings grid, PL settings, ranked results, Default regression (no phantom borders anywhere).

## v4.31 (2026-07-31)
- **def2/def3 re-import with own structure** (user: blocks carry their own 3D, no CSS fakery): cutout now keeps the dark structured shadow band on right/bottom (L-strip `lum<56` hugging the face bbox, `lum>62` face) while excluding only the flat 58-lum background; def2_block.png 536×698 (aspect 0.768 ≈ tile 0.764), def3 585×776. No borders/layers added in CSS.
- **New start screen** (`#start-overlay`) at boot: language seg (EN/PL moved here from playing header), layout picker (persists `pm_layout`, preselects last), full set grid (shared builder), big Start button, best-score-per-layout line (`updateStartBest`, from pm_results). Audio unlocked on Start click.
- **Lang buttons removed from playing header**; `.langbtn`/`data-lang` generic binding syncs EN/PL active state across start screen + settings.
- **No-moves rework**: `scheduleNoMovesCheck(delay)` (debounced, fresh `computeFreeCache`, guards overlay already shown / game over) called after match, both undo paths, shuffle, hint; new dedicated `#stuck-overlay` with **🔀 Shuffle (primary) / ↩ Undo / ✖ Close** buttons — Shuffle re-checks after 450 ms and re-opens if still dead.
- **Score FX tuning**: chips bigger (22 px), hold longer before the gravity drop (4-keyframe timeline, pop 20%, hold 44%, fall, 1080 ms).
- **Volume range 0–150%** (slider max 150), louder curve: gain = (vol/100)*0.5 (100% ≈ +47% louder than before).
- **Default-family faces are dots-only now** (default/def2/def3): numerals removed, single centered 15 px dot cluster (max-width 64 px, padding-bottom 20 for block lip). Match-by-number logic unchanged.
- Fix: `syncSetGrid` selector `#set-grid` → `.set-grid` so the start-screen grid also shows the ✓ active highlight.
- Verified headless: start EN (Default 2 ✓) / start PL (full localization), def2/def3 with structure band in game, dots-only Default, forced-stuck overlay with working buttons.

## v4.32 (2026-07-31)
- **New game mode: Hold 5 bar** (Tile-Master style), enabled via Settings → 🧩 Mode (Classic / Hold 5, persisted `pm_mode`, mode switch restarts current layout):
  - Tap a free tile → it flies (WAAPI ghost, arc, scale-down) into the 5-slot holding bar above the footer; reserved-slot push avoids landing collisions.
  - When 2 landed tiles share a pairKey they pop-vanish — full points pipeline reused (`computeMatchPts` speed multiplier + streak), chip flies from the bar to the score box; `moves` counts picks, win at last pair.
  - Undo returns the most recent landed pick to the board (`doBarUndo`); footer Undo routes by mode. Shuffle still works (penalty) on board tiles only.
  - **Bar-full alert** (`#barfull-overlay`): fires when 5 landed items have no pair; Undo/Shuffle/Close buttons; red bar flash on illegal picks; classic no-moves check is disabled in this mode (parking is the point), `scheduleNoMovesCheck` → `checkBarFull` instead.
  - Visuals match the game: dark bar strip + dashed cream slots, mini faces rendered from the same `getFace` (scale 0.548).
- **Cream alert buttons** (`.btn-cream`: same look as footer Tasuj — cream gradient + icon over 9 px label) for the Stuck and Bar-full alerts; Stuck Shuffle is no longer the odd green one.
- **Settings squeeze** (all visible without scrolling): rows 10→5 px padding, toggles 44×26→38×22, six toggles folded into a 3×2 `.tgl-grid`, smaller set cards (4 px pad), card padding 22→16, h2 20→18, narrower volume slider; added **🧩 Mode** row (Classic/Hold 5 segment, `.modebtn` wired + `syncModeSeg` in applyPerfMode/applyLang i18n).
- Verified headless: bar gameplay (2 parked items, +10 chip, score 10), bar-full overlay, squeezed settings (no scroll, all rows), cream Stuck buttons, classic def2 regression.

## v4.33 (2026-07-31)
- **Hold bar moved to the TOP** (`#hold-bar` between header and board, bottom-border + shadow).
- **Hold 5 now has its own layout** — "Pile 40" / "Sterta 40" (`scatter`), generated by `makeScatterTiles()` from the user's sketch: 40 tiles loosely scattered over ~5.4×8.2 units with natural overlaps, ~40% stacked on a second layer; a fresh random pile every game; hidden from Classic pickers, auto-forced in Hold 5 mode (Classic `genGame('scatter')` falls back to senior); results replay supports scatter.
- **Bar-mode freedom rule**: in Hold 5 a tile is pickable whenever nothing covers it from above (genre-standard; left/right rule kept only for Classic). Verified with food/mine13/def2 sets — "every set can be used there".
- i18n/notes bumped; montage includes the user's sketch panel next to the implementation.

## v4.34 — Hold 5 bar rework (2026-08-01)
- **Win detection fixed (root cause)**: pairs in the bar could be double-counted when a second landing happened inside the 240ms vanish window → pairsLeft went negative (never-ending games) or hit 0 early (premature win). Bar is now a fixed 5-pocket array; items marked `vanishing` immediately and excluded from matching; win fires exactly at pairsLeft==0. Added `gameId` token so flights/vanishes from a reset game can't corrupt state. Verified by auto-clearing a whole 36-tile pile: win at exactly 36 moves / 18 pairs.
- **Fluid arc flight**: stones fly to the bar in ONE motion along a quadratic curve that bows LEFT or RIGHT depending on pocket position (with slight lift + tumble rotation), 430ms, eased timing baked into the path. Ghost measures the tile BEFORE it shrinks.
- **Stone bar design**: slab is now a grey stone bar (`#hold-bar-inner`) with 5 carved dark pockets (deep inset shadows + rim highlight); blocks sit neatly inside (minis 96×126 @0.646). Auto-fits any phone width via `fitBar()` scale-down.
- **Sizes**: Hold 5 stones grew 84×110 → 96×126 (classic mode unchanged); pile is now 36 tiles (Pile 36 / Sterta 36) per request.
- **Chips**: +N chips are 30px (minus 26px), live 1500ms with longer hold, and are CLAMPED to the viewport so they never spawn off-screen. Streak bonuses spawn as shiny animated gold-gradient text with a 🔥 icon (+40 🔥…).
- Bar-mode scope respected: its own tuning (sizes/pile/flight) without touching classic mode or any textures.

## v4.35 — Hold 5: 50-piece stacked pile + pack-right + pocket look fix (2026-08-01)
- **Dot-block appearance in bar fixed**: v4.34 pocket override used `background:transparent !important` (shorthand) which wiped the block texture's background-image in bar minis (default/def2/def3 showed bare dots on the pocket). Now `background-color:transparent !important` — minis render identical to board tiles (verified via pixel crops).
- **Bar packs to the right**: after a pair vanishes (or an undo), the surviving stones slide to hug the rightmost pockets with a short FLIP animation; new picks fill the leftmost free pocket.
- **Harder pile**: 50 tiles (25 pairs), scattered in 3 layers — z1 starts after 45% placed, z2 after 68% (62% stack chance), tighter 0.52 same-layer spacing. Layout renamed Pile 50 / Sterta 50.
- **Bigger stones**: Hold 5 tiles grew 96×126 → 108×142 (classic untouched); bar minis re-scaled 0.576 to fit the same carved pockets; vanish/ghost scales updated to match.
- Re-verified end-to-end: auto-clear of the full 50-tile pile ends with the win overlay exactly at 0 pairs (51 moves incl. 1 shuffle).

## v4.36 — Riichi Mahjong set + Hold 5 deep piles & pack-left (2026-08-01)
- **New tile set: Mahjong 🀄** — tiles pulled from github.com/fluffystuff/riichi-mahjong-tiles (CC0 / public domain, thank you!). 34 real faces (Man/Pin/Sou 1-9, winds, dragons) composited onto the ivory tile body; works in every mode (classic layouts + Hold 5). Registered everywhere: set grids, hidden select, random pool, debug names. 144-tile layouts deal 34 types + 2 doubled ones (matching rules unchanged).
- **Empty tile imported but never dealt** — `riichi_blank.png` (ivory front) + sheet cell 34/35 (front/back) exist in assets only.
- **Sprite build gotcha fixed**: source PNGs are artwork-only (transparent body) → sheet = Front.png body + artwork per cell. Initial paste also stomped Haku/Pei cells — corrected.
- **Hold 5**: stones 108×142 → 124×162 (really visible now: pile footprint shrank to 4.4×5.7 so fit-zoom stays ~0.68); pile stacks up to 4 layers (z0-z3, 68% stack roll) — harder as requested. Flying ghosts of dot-block sets keep their exact look (square corners, no clip). Bar packs LEFT now (empty pockets on the right).
- **Anti-jam (forgivenness kept)**: full bar no longer dead-locks — a board stone may fly straight onto a parked matching pocket and pop both; bar-full overlay only shows when that rescue is impossible; bar-mode shuffle now accepts arrangements that free a bar-matching stone (pure permutation, no type cheats). Re-verified: full 50-tile 4-layer riichi pile won in 30s / 51 moves with win at exactly 0 pairs.

## v4.37 — Mahjong bright & dark in set menu + start-screen mode picker (2026-08-01)
- **Mahjong Dark set** 🀫— second flavor built from the repo's Black tiles (`tiles/riichi_dark_sheet.png`, same 34 faces on black bodies). Registered everywhere (set grids, hidden select, random pool, debug names, CC0 preserved).
- **Bug caught**: `riichi` never made it into `SET_ORDER` in v4.36 (silent failed hunk) so the Mahjong card wasn't actually visible in the menus — fixed; BOTH sets now show in the set grid + start screen.
- **Empty tiles imported, not dealt**: `riichi_dark_blank.png` joins `riichi_blank.png`; sheet cells 34/35 (empty/back) still excluded from the deal pool in both flavors.
- **Start screen: 🧩 Mode picker** (Classic / Hold 5) between language and layout; choosing Hold 5 greys out + disables the layout picker and hides the best-score line (piles are self-generated). No game restart until Start is pressed; stays in sync with the Settings mode seg.
