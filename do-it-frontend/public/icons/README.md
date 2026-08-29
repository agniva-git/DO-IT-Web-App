Icon assets needed here before the Bubblewrap/APK step (Milestone 21):

- favicon.ico
- apple-touch-icon.png       (180x180)
- icon-192.png               (192x192)
- icon-512.png               (512x512)
- icon-512-maskable.png      (512x512, with safe padding for maskable icons)

Referenced from vite.config.js (manifest.icons) and index.html.
The app builds and runs fine without these — Vite/PWA just won't have
real icons until they're added.