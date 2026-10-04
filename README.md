# Video Loop Player

*English / [日本語](README_ja.md)*

A single-page web app that plays **1 to N** local videos in a **continuous loop**:
`video 1 → video 2 → … → video N → video 1 → …`. Built mainly for iPad kiosk displays
at a conference poster table. No dependencies, no build step, a single-file app.

**→ [Open App](https://yukmmz.github.io/video-loop-player/)**

**Current version: v1.11.0**

## Features

- **Multiple videos**: pick one or more videos from Files / Photos, etc. (any number).
- **Continuous loop**: plays them in the chosen order and returns to the first after the last, forever.
- **Pause / play**: the "Play / Stop" button (stop = pause).
- **Frame stepping**: previous/next frame (`currentTime ± 1/fps`). fps is set in the UI (default 30).
- **Playback speed**: 0.1–5.0× slider plus presets (0.25/0.5/1/2×).
- **Temporary jump**: tap a video in the playlist → "repeat this video only".
  The **"Back to continuous loop"** button returns to the normal N-video loop.
- **Full screen**: "⛶ Full screen" or the ⛶ at the right of the header fills the screen with the video
  (both use the same full-screen mode). The file name is shown small at the bottom right; the shrink
  button at the top right (corners pointing in) or Esc brings you back
  (the Fullscreen API is also used on PC/Android).
- **Collapsible controls**: "▾ Controls" at the right of the header hides/shows the control buttons.
- **Tap for the control bar**: while collapsed / in full screen, tapping the screen brings up
  play/stop and frame-step buttons, which disappear after about 3 seconds (or on another tap).
- **Settings (⚙)**: the ⚙ at the right end of the header opens the settings window (a centered panel):
  language (Japanese / English), share (show QR codes), changelog, other apps (app list).
  Close with ✕, a tap outside, or Esc. A red dot appears on ⚙ the first time you open a new version.
- **How to use (?)**: the ? in the header (just left of ⚙) or the `?` key opens the how-to window
  (basic operation, keyboard shortcuts, notes for iPad). Close with Close, a tap outside, or Esc.
- **Feedback (FB)**: the FB in the header (just left of ?) opens a window to send comments or a bug
  report to the developer (contact is optional). Nothing is sent until you press Send
  (see [Saved data](#saved-data)). Close with Close, a tap outside, or Esc.
- **QR codes**: Settings → "Show QR codes" shows QR codes for the app URL and the source side by side
  (so visitors can open it on their phones). Close with Close, a tap outside, or Esc.
- **Version display**: the version is shown small next to the app name at the top left. Tap it to open the changelog.
- **Language**: the UI is in Japanese and English. The first visit follows the browser language (ja* → Japanese);
  switching in settings is remembered in this browser (see [Saved data](#saved-data)).
- **PWA**: add to the home screen to launch offline (only the app itself is cached;
  the chosen videos are local blobs and are never uploaded or sent anywhere).

## Usage

Setting up an iPad for a conference display:

1. Publish this repository with **GitHub Pages** (`https://<user>.github.io/video-loop-player/`) or similar.
2. Open it in iPad Safari, then Share → **"Add to Home Screen"** (it can then launch offline).
3. Launch the app → **"Choose videos"** to pick the videos to show → the continuous loop starts automatically.
4. Settings for unattended display:
   - **Settings → Display & Brightness → Auto-Lock → Never**.
   - Turn on **Guided Access** and lock the iPad to the app (prevents mistakes and leaving the app).

> You can re-pick videos on the spot, so swapping content is just "Choose videos" again.
> During a session (as long as the app stays open) it can loop all day.

> **If the icon shows an "L" or does not update**: iOS "Add to Home Screen" uses
> `apple-touch-icon` (not the manifest icons). The tag is in place, but iOS caches icons
> aggressively, so **delete the existing home-screen icon, reload the page in Safari,
> and "Add to Home Screen" again**.

## Running locally

Opening `index.html` in a browser works, but the Service Worker (offline) and some APIs
need `http(s)`, so a simple local server is recommended:

```bash
cd video-loop-player
python3 -m http.server 8000
# open http://localhost:8000/ in a browser
```

Automated checks (Node only, no packages):

```bash
node tests/test_logic.js   # script compiles, CHANGELOG/STRINGS/sw.js/README consistency
```

## Saved data

The app keeps only two small values in the browser (`localStorage`): the chosen language
(`video-loop-player/lang`) and the last version whose changelog you have seen
(`video-loop-player/seen-version`). The chosen videos and the control state are never saved,
and the videos are never uploaded. When added to the home screen, the Service Worker also caches
the app's own files (not your videos) so it can start offline.

The only thing the app ever sends anywhere is what you write in the FB (feedback) window, and only
when you press Send, together with the app name, version and display language.

There is no "clear saved data" button; to remove these, clear this site's data in the browser settings.

## Versioning

Semantic versioning `MAJOR.MINOR.PATCH`; the first public release is 1.0.0.
Bump MINOR for new features, PATCH for bug fixes (MAJOR for breaking overhauls).
The displayed version is `APP_VERSION` in `index.html`. When updating, also bump `CACHE`
in `sw.js` (`...-vN`, an internal counter for cache refresh, separate from semver), and add
one entry to `CHANGELOG` in `index.html` (the in-app changelog; its first entry must match
`APP_VERSION`, written in both Japanese and English).

| version | Changes |
|---|---|
| 1.0.0 | First release (continuous loop, frame stepping, speed, PWA; published) |
| 1.1.0 | Full screen, collapsible control panel, iOS apple-touch-icon |
| 1.2.0 | Tap to show the control bar while collapsed / in full screen |
| 1.3.0 | Disabled double-tap zoom, smaller tap bar, speed/selection as buttons |
| 1.3.1 | Speed panel hidden by default, instructions moved to the help button |
| 1.4.0 | File picker renamed to "Open", added a "select video" chooser |
| 1.4.1 | Larger control bar, moved above the home indicator |
| 1.5.0 | Swipe left/right to step frames |
| 1.6.0 | QR code display, version display |
| 1.7.0 | Adjustable swipe stepping speed (frames / 100 px) |
| 1.7.1 | Swipe speed limit raised to 50, new presets (2/10/25/50) |
| 1.7.2 | Swipe speed limit raised to 100 (2/25/50/100), fixed-width numbers on buttons |
| 1.7.3 | Two QR codes side by side (left = app, right = source code) |
| 1.8.0 | Tidied the control bar (removed frame-step buttons, moved help/QR to the header) |
| 1.9.0 | Version shown next to the app name (tap for the changelog), ⛶ (full screen) and ⚙ (settings) at the right end of the header, settings with language / share (QR) / changelog / other apps, English UI (Japanese / English switch), QR button moved from the header into settings, red dot on ⚙ for a new version |
| 1.10.0 | "How to use" moved to a window opened by the ? button in the header (or the ? key) (removed the old "❔ Help" and the inline instruction panel, added a keyboard shortcut list), header full-screen button turned into an icon (a "shrink" shape while in full screen), the exit button at the top right in full screen also uses the shrink icon, supported video formats listed in "How to use" |
| 1.11.0 | "FB" button in the header (just left of ?): send feedback or a bug report to the developer |

## Known limitations (iOS Safari)

- **Playback speed**: iOS Safari may ignore or clamp extreme `playbackRate` values
  (especially above 2× or very slow). Use **frame stepping** for slow-motion checks. Check
  the range that works on the actual device beforehand.
- **Frame-step accuracy**: H.264 uses inter-frame compression, so a seek may be rounded to the
  nearest decodable frame. With the correct fps this is good enough in practice.
- **Autoplay**: the first action (choosing videos) is required. Switching afterwards is automatic.
  Silent videos benefit from muted autoplay, so playback rarely stalls.

## Files

```
video-loop-player/
├── index.html            # the app (HTML/CSS/JS all in one)
├── i18n.js               # Japanese/English switch (identical in every yukmmz.github.io app; don't edit per app)
├── manifest.webmanifest  # PWA manifest
├── sw.js                 # offline Service Worker (caches the app only)
├── icon-180.png / icon-192.png / icon-512.png  # icons (home screen, tab)
├── qr.svg / src-qr.svg   # QR codes for the app / source
├── tests/test_logic.js   # node checks (no packages)
├── LICENSE
├── README.md             # English (this file)
└── README_ja.md          # Japanese
```

## License

MIT — see [LICENSE](LICENSE).
