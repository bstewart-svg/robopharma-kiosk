# RoboPharma Touch Kiosk

## → **https://bstewart-svg.github.io/robopharma-kiosk/**

The trade-show touch kiosk for RoboPharma (Waalwijk, NL), built from Roxanne Lee's
October 2026 brief. It uses the screen layouts of the NACDS 2026 kiosk
(`bstewart-svg/nacds-kiosk`) in RoboPharma's own colours, type and logo.

**Screens:** Home → RoboWall (overview, five topics, the RoboWall film) → Central Fill
(floor-plan overview, seven steps, by the numbers) → About Us (three screens) → Let's
connect: tagline, website QR code and contact details over the drone flight of the
Waalwijk building.

**Touch behaviour**
- The menu at bottom right (Home · RoboWall · Central Fill · About us · Autoplay) is on every screen.
- **Autoplay** loops through every screen, about 9 s each. **Stop** returns to Home. Any other tap also stops it.
- Tapping empty space in the right third of the screen goes to the next screen, and the left third goes back. Buttons always take priority.
- With nothing touched for two minutes, the kiosk returns to Home (not while autoplay is running).

---

## Setting up the kiosk (Windows)

1. Connect to the internet and open the URL above **once**, with `?cache` on the end:
   `https://bstewart-svg.github.io/robopharma-kiosk/?cache`
   A readout at the bottom counts the files and turns green at
   `CACHED — RUNS OFFLINE (34 FILES)`. This takes a minute or two (about 75 MB).
2. From then on the kiosk runs with **no internet**. Whenever it is online again it
   picks up the latest version by itself.
3. To run it full screen, start Microsoft Edge in kiosk mode, for example from a shortcut
   in the Startup folder:

   ```
   msedge.exe --kiosk "https://bstewart-svg.github.io/robopharma-kiosk/" --edge-kiosk-type=fullscreen --no-first-run
   ```

   Use the same Windows user and browser profile every time, because the offline copy
   lives in that profile. Clearing browsing data removes it, and step 1 then has to be
   repeated while online.

Turning off sleep, notifications and update restarts needs admin rights on the machine.

---

## Updating it

Edit, commit and push to `main`. GitHub Pages republishes within a minute, and kiosks
pick the change up the next time they load the page while online.

- Changes to `index.html` reach kiosks automatically.
- **When you replace an image or video under an existing filename, bump `CACHE` in
  `sw.js`.** Otherwise kiosks keep showing the old file from their offline copy.
  Giving the new file a new name works too.

## What's in here

```
index.html   the whole app: screens, styles, Central Fill step data (CF_STEPS), logic
sw.js        service worker that keeps everything offline
assets/img   photos, floor-plan illustration, logo, QR code
assets/video home background, RoboWall film, Waalwijk film, drone loop
assets/fonts Manrope and IBM Plex Mono, so it renders correctly offline
```

The source material (Roxanne's slides, Brandfolder originals, the 186 MB drone master)
is kept locally in `_src/` and is not committed.

Brandfolder sources: RoboWall film `t54bp5ks2nkjmxw2nv8bnx`, drone `wgtnf77w257m6mmxqf9375th`,
floor plan `vgmrtr4xr34q8f4tsbb6fpp`, floor-plan spread (C-975) `4rwbn9vgnjn7hpmkjg8mh7j`.

The site is public on GitHub Pages but carries `noindex,nofollow` and a `robots.txt`
deny, so it won't appear in search results.
