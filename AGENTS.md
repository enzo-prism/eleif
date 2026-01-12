# Codex CLI Guide for eleif

## Project overview
- Static marketing site (plain HTML/CSS/JS) served locally via Vite.
- Core pages: `index.html`, `thank-you.html`, `thank-you-order.html`.
- Behavior lives in `script.js`; styling in `styles.css`.

## How the site works
- Tabs and hash routing: `.tabs__button[data-tab]` + `.panel[data-panel]` are synced in `script.js`.
- Gallery: `galleryManifest` in `script.js` lists files in `assets/gallery/`; `resolveGallerySrc` uses `encodeURI`.
- Forms: `data-model-form` and `data-order-form` submit to Formspree with a JS fetch; redirects use hidden `_redirect`.
- Share: `data-share-form` uses Web Share API / clipboard fallback.
- Theme: `#themeToggle` persists in storage; guarded for in-app browsers.

## Dev and test
- Dev server: `npm run dev` (Vite).
- Tests: `npm test` runs `scripts/perf-check.js`.

## Compatibility constraints (important)
- This site must work in Instagram in-app browsers and older WebViews.
- Avoid optional chaining, `Element.replaceChildren`, and `Element.toggleAttribute`; use guarded fallbacks.
- Guard `localStorage`, `matchMedia`, and `HTMLDialogElement` usage.
- Only enable `backdrop-filter` inside `@supports` with `-webkit-backdrop-filter` to prevent white screens.

## Content and copy rules
- Visible text must stay lowercase (tests assert no uppercase in rendered text or placeholders).
- Keep `data-` hooks intact; JS expects them to exist (or be safely nullable).

## Assets and performance
- Add new gallery images to `assets/gallery/` and list them in `galleryManifest` with width/height.
- Optimize large images (target <= 1600px width, compressed webp).
- `scripts/perf-check.js` enforces `fetchpriority`, dimensions, and gallery render logic.

## If you change structure
- Adding a new tab requires: HTML `data-tab` + `data-panel`, and `TAB_TITLES` update in `script.js`.
- Changing forms requires aligning hidden fields with `setupFormSubmission` expectations.
- Update `scripts/perf-check.js` alongside any intentional deviations from its checks.
