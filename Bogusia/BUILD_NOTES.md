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
