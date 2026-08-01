# RESTORE.md — get Bogusia back on Arena.ai from GitHub

**Purpose:** if the Arena.ai workspace ever vanishes / resets and all you have left is
the GitHub repo, this file gets you back to a fully working setup (game source +
browser preview + APK builds) in one sitting, and tells you how to modify the game,
keep the docs in sync, and push everything back to GitHub.

- **Repo:** https://github.com/chwaraf/Bogusia
- **Time needed:** ~10–15 min (mostly the toolchain download, which is automatic)

---

## TL;DR — the whole thing in 6 commands

```bash
cd /home/user
git clone https://github.com/chwaraf/Bogusia.git        # must land exactly in ~/Bogusia
cp -r Bogusia/bogusia-web bogusia-play-tmp               # recreate the preview mirror:
mkdir -p bogusia-play && cp -r Bogusia/bogusia-web/index.html Bogusia/bogusia-web/manifest.json Bogusia/bogusia-web/tiles Bogusia/bogusia-web/sounds bogusia-play/ && rm -rf bogusia-play-tmp
bash Bogusia/bootstrap.sh                                # self-healing build (JDK+SDK download on cold start)
```

Result: browser preview at `~/bogusia-play/index.html` and a freshly built
`~/Bogusia-v<ver>-debug.apk`. You are now exactly where the last session left off.

---

## Step 1 — Clone (the right way)

```bash
cd /home/user
git clone https://github.com/chwaraf/Bogusia.git
```

**Important:**

- Clone to **`/home/user/Bogusia` exactly**. `bootstrap.sh` and `build-apk.sh` use
  that absolute path.
- **⚠️ The repo HEAD may lag behind the last workspace build.** Check the version
  first thing:
  ```bash
  grep -o '<title>[^<]*' Bogusia/bogusia-web/index.html
  ```
  The sandbox workspace had the newest code; not every session was pushed to GitHub.
  If HEAD is older than the version you remember (see README's Version history),
  don't worry — the repo is now your source of truth, and future sessions should
  **push at the end of every sitting** (Step 5) so this never drifts again.

### What's in the repo vs. what the sandbox regenerates

| In the repo (comes with clone) | NOT in the repo (regenerated locally) |
|---|---|
| `bogusia-web/` — master game source + tiles + sounds | `bogusia-play/` — preview mirror (Step 2 recreates it) |
| `capacitor-app/` — Capacitor 6 Android project | `capacitor-app/www/` — built by scripts (gitignored) |
| `bootstrap.sh`, `build-apk.sh`, docs, LICENSE | `toolchain/` (JDK 17 + SDK 34) — bootstrap downloads it |
| `.gitignore` — keeps artifacts out of commits | `node_modules/`, `.gradle/`, APK output — build artifacts |

## Step 2 — Recreate the workspace extras

```bash
# browser-preview mirror (identical content to bogusia-web):
mkdir -p /home/user/bogusia-play
cp -r /home/user/Bogusia/bogusia-web/index.html \
      /home/user/Bogusia/bogusia-web/manifest.json \
      /home/user/Bogusia/bogusia-web/tiles \
      /home/user/Bogusia/bogusia-web/sounds \
      /home/user/bogusia-play/
```

> The mirror is how the game is previewed in a browser without installing the APK.
> `bootstrap.sh` also uses it as an asset backup (union-syncs tiles/sounds both ways).

## Step 3 — Build

```bash
bash /home/user/Bogusia/bootstrap.sh          # or: bash Bogusia/bootstrap.sh --check
```

- Cold start (nothing cached): **~5–8 min** — downloads JDK 17 + Android SDK 34
  into `~/toolchain/`, then npm + Gradle build.
- Warm start: **~1–2 min**.
- Needs ~1.5 GB free disk during a cold build; `toolchain/` (~110 MB) can be deleted
  afterwards — see README.
- Output: `~/Bogusia-v<version>-debug.apk` (version is read from the game title).
  Debug-signed → installs over previous debug builds.

## Step 4 — Modify the game (standard change cycle)

> **House rule: every change → bump version + update preview + compile new APK.**

1. **Edit the master:** `nano`/edit `~/Bogusia/bogusia-web/index.html`
   (single file; everything is in there — README has a code map).
2. **Bump the version in 3 places, both locales:**
   - `<title>Pile Match vX.YY …</title>`
   - `I18N.en.legal` **and** `I18N.pl.legal`
   - `I18N.en.settingsNote` **and** `I18N.pl.settingsNote`
3. **Changed structures?** Run the Node test harness (see README → Testing
   structures) — even count, 44–80, drainable, ≥50% ground fill, ≥3 columns wide.
4. **Sync the preview mirror:** `cp Bogusia/bogusia-web/index.html bogusia-play/`
   (plus any new files in `tiles/` or `sounds/`).
5. **Build:** `bash Bogusia/bootstrap.sh` → verify APK contents
   (`unzip -l ~/Bogusia-v*.apk | grep sounds`) → delete the previous version APK.
6. **Grep-verify every edit landed** — Arena snapshots have silently reverted file
   edits mid-session before:
   `grep -n "your-new-code" Bogusia/bogusia-web/index.html`

### Keep ALL the docs in sync (required, not optional)

Whenever behavior changes, update in the **same sitting**:

| File | Update when |
|---|---|
| `bogusia-web/index.html` | the change itself (+ version bump, both locales) |
| `bogusia-play/index.html` | always — must stay byte-identical to the master |
| **`README.md`** | features, rules, structures list, settings keys, **Version history** row for the new vX.YY |
| **`PROMPT.md`** | the spec/"sacred constraints" changed — the from-scratch prompt must describe the game as it is NOW |
| **`RESTORE.md`** | the workflow/paths/build process changed (this file!) |
| `BUILD_APK.md` | the manual build steps changed |

Rule of thumb: **code + docs + preview + APK move together in one commit.**

## Step 5 — Push back to GitHub (end of every sitting!)

```bash
cd /home/user/Bogusia
git status
git add -A
git commit -m "v4.47: <short description of the change>"
git push origin main
```

- **Credentials:** pushing needs a GitHub **Personal Access Token** (Settings →
  Developer settings → Tokens → `repo` scope) — use it as the password, or set up
  SSH. Don't store tokens in the workspace; Arena snapshots deliberately exclude
  credential files (`.git-credentials`, `.netrc`), so you'll re-enter the token each
  fresh workspace. That's normal.
- **`git pull` / conflicts:** if the repo moved while you worked
  (`git pull --rebase origin main`), and `index.html` conflicts, treat
  **`bogusia-web/index.html` as the source of truth** — resolve in its favor unless
  you knowingly made the remote change yourself.
- **APKs:** keep them out of git. Publish builds via **GitHub Releases**
  (Releases → Draft new release → attach `Bogusia-vX.YY-debug.apk`, tag `vX.YY`) —
  that way anyone can download the game without building.
- **If `.git` vanished** (Arena drops it sometimes): `bash Bogusia/bootstrap.sh`
  re-attaches it automatically; or manually:
  `git clone https://github.com/chwaraf/Bogusia /tmp/x && mv /tmp/x/.git ~/Bogusia/`.

## Step 6 — Tell the Arena agent where you are

First message in a fresh Arena session after a restore:

> "The Bogusia project is restored from GitHub in ~/Bogusia, preview mirror is
> ~/bogusia-play. Read RESTORE.md + README.md first; master source is
> bogusia-web/index.html; remember the house rule: every change → version bump →
> sync preview → new APK → commit & push."

(Or just paste PROMPT.md's workflow rules. The agent will pick it up from there.)

---

## License

This project is released under the **MIT License** (see `LICENSE`) — a free,
permissive public license: anyone may use, copy, modify, publish and distribute the
code, including commercially, as long as the copyright notice stays. The APK you
build is yours to share freely (upload to GitHub Releases, send to friends, etc.).

- The MIT license covers the **code**. Files in `tiles/` and the music in `sounds/`
  are bundled for personal use in this game — the AI-generated `fire-*.mp3` voice
  clips were made for this project and are MIT-covered too.
- Want stronger copyleft instead (derivatives must stay open-source)? Swap `LICENSE`
  for **GPL-3.0** — say the word and it can be changed before the next push.
- To make it official on GitHub after cloning: the `LICENSE` file is already in the
  repo root, so `git push` publishes it automatically. GitHub will display the
  "MIT" badge on the repo page.

---

*When in doubt: `bash Bogusia/bootstrap.sh --check` shows exactly what's present and
what's missing. Powodzenia! 🀄*
