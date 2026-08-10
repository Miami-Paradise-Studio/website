# Miami Paradise Studio

> We build competitive worlds that fight back.

Marketing site for Miami Paradise Studio and its game in development, **SHARD Protocol**, a tactical 4v4 PvP title with voice command mechanics.

Two pages. Astro with static output, a WebGL hero, and scroll choreography. Nothing is fetched from a third-party origin at runtime.

## Getting started

Requires **Node 22.12 or newer** (Astro 7's floor).

```bash
npm install
npm run dev        # http://localhost:4321
```

```bash
npm run build      # static output into dist/
npm run preview    # serves the built site on :8000
npm test           # astro check + stylelint
```

The Content Security Policy is generated at build time, so it only exists in `build` and `preview` output. `dev` will not show CSP problems.

## Stack

| Package | Version | Why |
|---|---|---|
| astro | 7.2 | Static output, islands, so pages without the 3D scene ship none of its JavaScript |
| react / react-dom | 19.2.8 (pinned flat) | Island framework for the WebGL hero |
| tailwindcss + @tailwindcss/vite | 4.3 | CSS-first tokens. The `@astrojs/tailwind` integration is deprecated and is not used |
| three | ~0.185.1 | Renderer |
| @react-three/fiber, drei, postprocessing | 9.7 / 10.7 / 3.0 | React bindings, scene helpers, merged effect pass |
| gsap + @gsap/react | 3.15 / 2.1 | ScrollTrigger and SplitText. The whole plugin set has been free since April 2025 |
| lenis | 1.3 | Single scroll authority, feeding ScrollTrigger |

### Version pins that are not decoration

`react` and `react-dom` are pinned flat, not caret-ranged. `@react-three/fiber` accepts `>=19 <19.3` and `@react-three/postprocessing` requires `^19.2.0`; a routine `npm update` past 19.3 breaks the install. `three` is tilde-pinned because `postprocessing` caps it below 0.186.

Check those peer ranges before bumping either.

## Structure

```
src/
  pages/            index.astro, shard-protocol.astro
  layouts/          Layout.astro, the whole document head
  components/       Header, Footer, Icon (Astro) + HeroScene (React island)
  lib/motion.ts     Lenis, ScrollTrigger, SplitText, service worker registration
  styles/global.css Tailwind entry, @theme tokens, bespoke effects
  assets/fonts/     Variable woff2, consumed by Astro's Fonts API
public/
  _headers          Security and cache headers (Netlify / Cloudflare Pages syntax)
  sw.js             Service worker
  offline.html      Offline fallback, no scripts
  assets/           Icon sprite and images
  robots.txt, site.webmanifest, .well-known/security.txt
```

## The hero scene

`src/components/HeroScene.tsx` renders an infinite grid horizon, a reflective floor, a floating shard with a counter-rotating wire cage, and a sparkle field, through one `EffectComposer` (bloom, chromatic aberration, scanlines, grain, vignette).

Three things about it are deliberate and easy to break:

- **It mounts with `client:idle`, not `client:visible`.** The component renders `null` until its own boot gate opens, so a visibility observer would watch a zero-height placeholder and never fire.
- **three.js boots after first paint**, behind `requestIdleCallback`, so the headline is the LCP element rather than the canvas.
- **It never mounts under `prefers-reduced-motion`.** The page is designed to work without it.

Quality degrades through `PerformanceMonitor` and `AdaptiveDpr` rather than a device sniff.

## Motion

Lenis owns scroll and feeds `ScrollTrigger.update`; the two must not both drive the page or they drift.

`SplitText` shreds a heading into per-line boxes, which a screen reader would announce one fragment at a time. The heading itself carries an `aria-label` and the generated lines are `aria-hidden`. This works because a heading's role accepts an accessible name; the same trick on a plain `div` does not, which is the documented hole in SplitText's own remediation. Do not "fix" this by duplicating the heading into a hidden twin: that puts two `h1` elements in the document.

Headings split only after `document.fonts.ready`. Splitting earlier measures the fallback font and collapses the line boxes to nothing.

## Security

`astro.config.mjs` sets `security.csp`, so Astro emits a per-page `<meta>` CSP containing a hash for every inline script and style it generated. There is no `unsafe-inline`.

That is why the site does **not** use `<ClientRouter />`: Astro's client router is incompatible with CSP. Cross-page transitions come from the native `@view-transition` rule in `global.css` instead, which needs no JavaScript. Astro`s own `prefetch` (hover strategy) warms the other page. Speculation Rules were tried and dropped: once the policy carries hashes, Chrome rejects an inline rules block unless its own hash is listed, and that hash breaks on every edit of the block.

`frame-ancestors` is absent from the meta policy because browsers ignore it there. Framing is denied by `X-Frame-Options` in `public/_headers`, alongside HSTS, Referrer-Policy, Permissions-Policy and the cross-origin isolation headers.

## No third-party origins

Fonts, icons and the particle library are vendored. Icons come from Font Awesome Free 6.5.1 (CC BY 4.0) as symbols in `public/assets/icons.svg`. Fonts are Archivo (variable, with the width axis) and Martian Mono, served through Astro's Fonts API with a metric-matched fallback so the font swap costs no layout shift.

## Design

Colour, type and layout decisions live in [DESIGN.md](DESIGN.md); audience and tone in [PRODUCT.md](PRODUCT.md). Read DESIGN.md before changing the palette: the amber is a deliberate departure from the cyan-on-black reflex and it carries the whole identity.

## Interaction model

One rule keeps this from becoming noise: **every response maps to a real change of state**. Nothing animates to prove it can.

- **Scroll** reveals a block once, and draws the roadmap spine. Nothing re-animates on the way back up.
- **Hover** belongs only to things that are actually actionable: nav links, live cards, primary buttons. Disabled controls stay inert on purpose, because a dead button that reacts is a lie.
- **Click** is navigation and the mobile menu, nothing else.
- The hero shard is the one object that answers the pointer, through the cursor and its emissive level.

Everything above is gated on `(pointer: fine)` and skipped entirely under `prefers-reduced-motion`, where the loops are not started at all rather than run at zero amplitude.

## Known gaps

- Card expansion through same-document view transitions is designed for but not built: the pillar, voice and class cards have no second state, and inventing detail copy for them would put words in the studio's mouth. The mechanism is already in place if that content ever arrives.

- No contact route is published anywhere. Every "get in touch" path is a disabled button. This is the largest thing standing between the site and its stated goal of reaching press and investors.
- `android-chrome-512x512.png` is 474 kB for a 512 px icon. It is kept out of the service worker precache so it costs nothing on a first visit, but it wants a PNG quantizer.
- The hero shard can clip at the right edge on narrow desktop widths between roughly 1024 and 1200 px.
- `MeshTransmissionMaterial` on the shard was tried and reverted. It cost 4 kB and no frames, but the scene is too dark to refract anything, so the glass version simply disappeared inside its own wire cage.

## License

`package.json` declares MIT. No LICENSE file is committed yet, so that declaration is currently unbacked. Add one before treating the repo as open source.
