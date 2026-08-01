# Building the Bogusia APK locally

Everything needed is in this workspace; only the toolchain (JDK + Android SDK + Node) must be installed on your machine — it can't be shipped in a workspace.

## What you need installed once

| Tool | Version | Notes |
|---|---|---|
| JDK | **17** (Temurin/OpenJDK) | AGP 8.x fails on Java 11. `JAVA_HOME` must point to it. |
| Node.js | 18+ (any current LTS) | provides `npm`/`npx` |
| Android SDK | `platform-tools`, `platforms;android-34`, `build-tools;34.0.0` | install via Android Studio or `cmdline-tools` + `sdkmanager`; accept licenses |

## One-command build (Linux/macOS/Git-Bash)

```bash
export JAVA_HOME=/path/to/jdk17
export ANDROID_HOME=/path/to/android-sdk
bash build-apk.sh
```

Result: `Bogusia/pile-match-project/android/app/build/outputs/apk/debug/app-debug.apk`

The script: syncs `bogusia-web/` → `pile-match-project/www/` (so the current game version is packed), runs `npm install` (first time), `npx cap sync android`, then `gradlew assembleDebug`.

## Windows (without Git-Bash)

```bat
cd Bogusia\pile-match-project
copy /Y ..\..\bogusia-web\index.html www\
copy /Y ..\..\bogusia-web\manifest.json www\
copy /Y ..\..\bogusia-web\tiles\*.png www\tiles\
npm install
npx cap sync android
echo sdk.dir=%LOCALAPPDATA%\Android\Sdk > android\local.properties
cd android
gradlew.bat assembleDebug
```

## Signing

Debug builds are signed with the standard debug key (installs over previous debug builds).
For a Play Store release you need a **release keystore** + `assembleRelease`/bundle — say the word and I'll wire `build.gradle` signing config for it.

## Game source of truth

`bogusia-web/index.html` (+ `bogusia-web/tiles/`) is the master version.
`pile-match-project/www/` is the copy that goes into the APK — the script keeps it in sync.
