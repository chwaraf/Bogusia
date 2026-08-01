# BUILD_APK.md — build the Android APK on your own machine

> On the **Arena.ai sandbox**, don't use this file — run `bash bootstrap.sh`
> (it auto-installs the toolchain). This guide is for a normal PC/Mac where you
> install tools yourself once. Restoring to Arena from GitHub? See `RESTORE.md`.

Everything needed is in this repo; only the toolchain (JDK + Android SDK + Node)
must be installed on your machine — it can't be shipped in a repo.

## What you need installed once

| Tool | Version | Notes |
|---|---|---|
| JDK | **17** (Temurin/OpenJDK) | AGP 8.x fails on Java 11. `JAVA_HOME` must point to it. |
| Node.js | 18+ (any current LTS) | provides `npm`/`npx` |
| Android SDK | `platform-tools`, `platforms;android-34`, `build-tools;34.0.0` | install via Android Studio or `cmdline-tools` + `sdkmanager`; accept licenses |

## One-command build (Linux/macOS/Git-Bash)

```bash
git clone https://github.com/chwaraf/Bogusia.git
cd Bogusia
export JAVA_HOME=/path/to/jdk17
export ANDROID_HOME=/path/to/android-sdk
bash build-apk.sh
```

Result: `capacitor-app/android/app/build/outputs/apk/debug/app-debug.apk`

The script: syncs `bogusia-web/` → `capacitor-app/www/` (so the current game
version is packed), runs `npm install` (first time), `npx cap sync android`,
then `gradlew assembleDebug`.

## Windows (without Git-Bash)

```bat
cd Bogusia\capacitor-app
copy /Y ..\bogusia-web\index.html www\
copy /Y ..\bogusia-web\manifest.json www\
copy /Y ..\bogusia-web\tiles\*.png www\tiles\
copy /Y ..\bogusia-web\sounds\*.mp3 www\sounds\
npm install
npx cap sync android
echo sdk.dir=%LOCALAPPDATA%\Android\Sdk > android\local.properties
cd android
gradlew.bat assembleDebug
```

## Low-RAM machines

`capacitor-app/android/gradle.properties` is already tuned for small machines
(~2 GB RAM): `org.gradle.jvmargs=-Xmx768m`, `org.gradle.daemon=false`,
`org.gradle.workers.max=1`. These are deliberate — don't "upgrade" them, or the
Gradle daemon gets OOM-killed mid-build.

## Signing

Debug builds are signed with the standard debug key (installs over previous
debug builds). For a Play Store release you need a **release keystore** +
`assembleRelease`/bundle — the signing config is not wired yet; add it to
`android/app/build.gradle` when needed. To share the game without the Play
Store, attach the APK to a **GitHub Release** instead.

## Game source of truth

`bogusia-web/` is the master version (single-file game + tile PNGs + sound MP3s).
`capacitor-app/www/` is the copy that goes into the APK — the script keeps it in
sync; never edit `www/` directly.
