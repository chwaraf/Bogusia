#!/usr/bin/env bash
# =============================================================================
# bootstrap.sh — one-command rebuild of the Bogusia APK from any workspace state.
#
#   bash bootstrap.sh           set up whatever is missing, then build the APK
#   bash bootstrap.sh --check   only report what's present / missing
#
# Why this exists: workspace snapshots drop anything over ~128 MB / 10k files,
# plus node_modules/ and .gradle/ are always excluded. This script restores
# the build toolchain on demand (JDK 17 + Android SDK 34), lets build-apk.sh
# handle the rest (npm install, cap sync, gradle), and copies the result to
# ~/Bogusia-<version>-debug.apk. Requires curl, unzip and Node.js 18+ —
# all present in the default sandbox. Everything it downloads goes to
# ~/toolchain and archives are deleted right after unpacking.
# =============================================================================
set -euo pipefail

ROOT="$HOME"
TC="$ROOT/toolchain"
JDK="$TC/jdk17"
SDK="$TC/android-sdk"
SDKMANAGER="$SDK/cmdline-tools/latest/bin/sdkmanager"
REPO="$ROOT/Bogusia"
PROJECT="$REPO/Bogusia/pile-match-project"
BUILD_SH="$REPO/build-apk.sh"
WEB_INDEX="$REPO/bogusia-web/index.html"

JDK_URL="https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse"
SDK_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

say() { printf '\n=== %s ===\n' "$*"; }

status() { # $1 label  $2 probe path
  if [ -e "$2" ]; then echo "  [OK]      $1"; return 0
  else              echo "  [MISSING] $1"; return 1; fi
}

check_all() {
  say "Toolchain status"
  local missing=0
  status "JDK 17"                 "$JDK/bin/java"                          || missing=1
  status "Android cmdline-tools"  "$SDKMANAGER"                            || missing=1
  status "platform-tools"         "$SDK/platform-tools/adb"                || missing=1
  status "platforms;android-34"   "$SDK/platforms/android-34/android.jar"  || missing=1
  status "build-tools;34.0.0"     "$SDK/build-tools/34.0.0/apksigner"      || missing=1
  status "game source (bogusia-web)" "$WEB_INDEX"                          || missing=1
  status "capacitor project"      "$PROJECT/package.json"                  || missing=1
  if [ -d "$PROJECT/node_modules" ]; then echo "  [OK]      node_modules"
  else echo "  [auto]      node_modules   (restored by build-apk.sh)"; fi
  if [ -d "$ROOT/.gradle/wrapper" ]; then echo "  [OK]      gradle cache"
  else echo "  [auto]      gradle cache   (downloaded on first build, ~1-2 min)"; fi
  return $missing
}

# ---------- --check mode: report only ----------
if [ "${1:-}" = "--check" ]; then
  if check_all; then echo; echo "Everything present — run:  bash bootstrap.sh"; exit 0
  else echo; echo "Some pieces missing — run:  bash bootstrap.sh  (they'll be installed)"; exit 1; fi
fi

# ---------- sanity: the repo itself must be here ----------
if [ ! -f "$BUILD_SH" ]; then
  echo "ERROR: Bogusia repo not found at $REPO"
  echo "Clone it first:  git clone https://github.com/chwaraf/Bogusia \"$REPO\""
  exit 1
fi
command -v curl >/dev/null || { echo "ERROR: curl not found"; exit 1; }
command -v unzip >/dev/null || { echo "ERROR: unzip not found"; exit 1; }
command -v node >/dev/null && command -v npm >/dev/null \
  || { echo "ERROR: Node.js 18+ (with npm) not found — install it first"; exit 1; }

# ---------- 1) JDK 17 ----------
say "1/4  JDK 17"
if [ -x "$JDK/bin/java" ]; then
  echo "already installed — skipping"
else
  mkdir -p "$TC"
  echo "downloading Temurin JDK 17 (~190 MB)..."
  curl -fSL -o "$TC/jdk17.tar.gz" "$JDK_URL"
  rm -rf "$TC"/jdk-17*              # wipe partial leftovers from snapshot-trimmed restores
  tar xzf "$TC/jdk17.tar.gz" -C "$TC"
  rm -rf "$JDK"
  mv "$TC"/jdk-17* "$JDK"
  rm -f "$TC/jdk17.tar.gz"          # don't leave archives in the workspace
fi

export JAVA_HOME="$JDK"
export ANDROID_HOME="$SDK"
export ANDROID_SDK_ROOT="$SDK"
export PATH="$JDK/bin:$PATH"

# ---------- 2) Android cmdline-tools ----------
say "2/4  Android cmdline-tools"
if [ -x "$SDKMANAGER" ]; then
  echo "already installed — skipping"
else
  mkdir -p "$SDK/cmdline-tools"
  echo "downloading command line tools (~150 MB)..."
  curl -fSL -o "$TC/cmdline-tools.zip" "$SDK_URL"
  unzip -q -o "$TC/cmdline-tools.zip" -d "$TC"
  rm -rf "$SDK/cmdline-tools/latest"
  mv "$TC/cmdline-tools" "$SDK/cmdline-tools/latest"
  rm -f "$TC/cmdline-tools.zip"
fi

# ---------- 3) SDK packages ----------
say "3/4  Android SDK packages"
need=0
[ -e "$SDK/platform-tools/adb" ]                || need=1
[ -e "$SDK/platforms/android-34/android.jar" ]  || need=1
[ -e "$SDK/build-tools/34.0.0/apksigner" ]      || need=1
if [ "$need" = 0 ]; then
  echo "platform-tools, android-34, build-tools 34.0.0 already installed — skipping"
else
  # wipe partial dirs first — snapshots can leave half-restored packages, and
  # sdkmanager would then sidestep them by installing into "-2" suffixed paths gradle won't find
  rm -rf "$SDK/platform-tools" "$SDK/platform-tools-2" "$SDK/platforms/android-34" "$SDK/platforms/android-34-2" "$SDK/build-tools/34.0.0" "$SDK/build-tools/34.0.0-2"
  yes | "$SDKMANAGER" --licenses > /dev/null 2>&1 || true
  "$SDKMANAGER" "platform-tools" "platforms;android-34" "build-tools;34.0.0"
fi

# ---------- self-heal game assets & git link (snapshots may drop big folders) ----------
say "Asset check"
TILES_DIR="$REPO/bogusia-web/tiles"
SOUNDS_DIR="$REPO/bogusia-web/sounds"
# union-sync both live copies first — snapshot trims hit one side at a time, so the
# surviving copy is the best source; do this BEFORE any probing
for pair in "$ROOT/bogusia-play/tiles:$TILES_DIR" "$ROOT/bogusia-play/sounds:$SOUNDS_DIR"; do
  SIDE="${pair%%:*}"; MASTER="${pair##*:}"
  mkdir -p "$MASTER" "$SIDE"
  for f in "$SIDE"/*; do
    [ -e "$f" ] || continue
    [ -e "$MASTER/$(basename "$f")" ] || { cp "$f" "$MASTER/" && echo "  [FIX]     $(basename "$f") restored from bogusia-play"; }
  done
  for f in "$MASTER"/*; do
    [ -e "$f" ] || continue
    [ -e "$SIDE/$(basename "$f")" ] || cp "$f" "$SIDE/"
  done
done
if ls "$TILES_DIR"/*.png >/dev/null 2>&1; then
  echo "  [OK]      tiles ($(ls "$TILES_DIR"/*.png | wc -l) png)"
else
  mkdir -p "$TILES_DIR"
  if ls "$ROOT/bogusia-play/tiles"/*.png >/dev/null 2>&1; then
    cp "$ROOT/bogusia-play/tiles"/*.png "$TILES_DIR/"
    echo "  [FIX]     tiles restored from bogusia-play copy"
  else
    APK=$(ls -t "$ROOT"/Bogusia-*.apk 2>/dev/null | head -1 || true)
    if [ -n "$APK" ]; then
      rm -rf /tmp/apkfix && unzip -q -o "$APK" 'assets/public/tiles/*.png' -d /tmp/apkfix && cp /tmp/apkfix/assets/public/tiles/*.png "$TILES_DIR/" && rm -rf /tmp/apkfix
      echo "  [FIX]     tiles restored from $(basename "$APK")"
    else
      rm -rf /tmp/bogusia-fix && git clone --quiet https://github.com/chwaraf/Bogusia /tmp/bogusia-fix && cp /tmp/bogusia-fix/bogusia-web/tiles/*.png "$TILES_DIR/" && rm -rf /tmp/bogusia-fix
      echo "  [FIX]     tiles restored from GitHub"
    fi
  fi
fi
if ls "$SOUNDS_DIR"/*.mp3 >/dev/null 2>&1; then
  echo "  [OK]      sounds ($(ls "$SOUNDS_DIR"/*.mp3 | wc -l) mp3)"
else
  mkdir -p "$SOUNDS_DIR"
  if ls "$ROOT/bogusia-play/sounds"/*.mp3 >/dev/null 2>&1; then
    cp "$ROOT/bogusia-play/sounds"/*.mp3 "$SOUNDS_DIR/"
    echo "  [FIX]     sounds restored from bogusia-play copy"
  else
    APK=$(ls -t "$ROOT"/Bogusia-*.apk 2>/dev/null | head -1 || true)
    if [ -n "$APK" ]; then
      rm -rf /tmp/apkfixs && unzip -q -o "$APK" 'assets/public/sounds/*.mp3' -d /tmp/apkfixs && cp /tmp/apkfixs/assets/public/sounds/*.mp3 "$SOUNDS_DIR/" && rm -rf /tmp/apkfixs
      echo "  [FIX]     sounds restored from $(basename "$APK")"
    else
      echo "  [warn]    sounds not recoverable (clips exist only in this workspace) — music/voice will be silent"
    fi
  fi
fi
if [ ! -d "$REPO/.git" ]; then
  rm -rf /tmp/bogusia-git
  if git clone --quiet https://github.com/chwaraf/Bogusia /tmp/bogusia-git && mv /tmp/bogusia-git/.git "$REPO/.git"; then
    rm -rf /tmp/bogusia-git; echo "  [FIX]     .git re-attached from GitHub"
  else
    echo "  [warn]    .git restore failed — build continues anyway"
  fi
fi

# ---------- 4) Build ----------
say "4/4  Building APK"
bash "$BUILD_SH"   # syncs bogusia-web -> www, npm install if needed, cap sync, gradle

VER=$(grep -oE 'v4\.[0-9]+' "$WEB_INDEX" 2>/dev/null | head -1 || true)
VER=${VER:-latest}
APK_SRC="$PROJECT/android/app/build/outputs/apk/debug/app-debug.apk"
APK_OUT="$ROOT/Bogusia-${VER}-debug.apk"
cp "$APK_SRC" "$APK_OUT"

say "DONE"
ls -la "$APK_OUT"
echo "Web preview (no install needed): $ROOT/bogusia-play/index.html"
