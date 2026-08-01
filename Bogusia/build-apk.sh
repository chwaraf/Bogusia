#!/usr/bin/env bash
# Builds the Bogusia APK from capacitor-app/ (Capacitor 6 + Android SDK).
# Syncs bogusia-web/ -> capacitor-app/www/ first, so the current game is packed.
# Usage: bash build-apk.sh            (first run needs internet for npm/gradle deps)
set -euo pipefail

PROJECT="$(cd "$(dirname "$0")" && pwd)/capacitor-app"
WEB="$(cd "$(dirname "$0")" && pwd)/bogusia-web"

# --- toolchain env (adjust if your SDK/JDK live elsewhere) ---
: "${JAVA_HOME:?Set JAVA_HOME to a JDK 17 install (AGP requires JDK 17)}"
: "${ANDROID_HOME:?Set ANDROID_HOME to your Android SDK (needs: platform-tools, platforms;android-34, build-tools;34.0.0)}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

cd "$PROJECT"

# 1) sync the latest web build into the app package
mkdir -p www www/tiles www/sounds
cp "$WEB/index.html" "$WEB/manifest.json" www/
cp "$WEB"/tiles/*.png www/tiles/
rm -f www/sounds/*.mp3
cp "$WEB"/sounds/*.mp3 www/sounds/ 2>/dev/null || true

# 2) node deps (first run only needs the network)
[ -d node_modules ] || npm install --no-audit --no-fund

# 3) capacitor sync (copies www -> android/app/src/main/assets/public)
npx cap sync android

# 4) point gradle at the SDK for this machine
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# 5) build
cd android
chmod +x gradlew 2>/dev/null || true
./gradlew assembleDebug --console=plain

APK="app/build/outputs/apk/debug/app-debug.apk"
echo
echo "==================================="
echo "APK ready: $PROJECT/android/$APK"
echo "==================================="
