# Miami Paradise Studio

> We build competitive worlds that fight back.

Static marketing site for Miami Paradise Studio and its game in development, **SHARD Protocol**, a tactical 4v4 PvP title with voice command mechanics.

Three pages, no build step, no framework. Open the folder in a static server and it runs.

## Getting started

```bash
npm install          # dev tooling only, the site itself has no dependencies
npm start            # serves on http://localhost:8000
```

Any static server works. `python3 -m http.server 8000` is enough if you would rather not install anything.

Service worker note: the site registers `sw.js`, which caches assets. When editing CSS or JS locally, either use a hard reload or unregister the worker in DevTools, otherwise you will keep seeing the cached copy.

## Checks

```bash
npm test             # html-validate + stylelint + eslint
```

All three must pass before a commit. Stylelint reports `no-duplicate-selectors` as warnings: `assets/css/style-new.css` still contains selector blocks declared twice, where the two copies are separated by a media query that targets the same selector. Merging those blocks moves them in source order and changes what the cascade picks, so they are left alone deliberately. See "Known debt" below.

## Structure

```
/
├── index.html              # Landing page
├── shard-protocol.html     # SHARD Protocol detail page
├── offline.html            # Service worker fallback, no scripts
├── site.webmanifest        # PWA manifest
├── sw.js                   # Service worker
├── robots.txt
├── sitemap.xml
├── _headers                # Security and cache headers (Netlify / Cloudflare Pages syntax)
├── .well-known/
│   └── security.txt
└── assets/
    ├── css/style-new.css   # The whole stylesheet
    ├── fonts/              # Self-hosted woff2, latin subset
    ├── icons.svg           # SVG sprite, referenced with <use>
    ├── images/
    └── js/
        ├── main-new.js
        └── vendor/tsparticles.bundle.min.js
```

## No third-party origins

Every asset is served from this origin. Fonts, icons and the particle library are vendored into the repo rather than pulled from a CDN. That keeps visitor IP addresses off other companies' servers, removes a supply chain dependency, and lets `_headers` ship a `default-src 'self'` Content Security Policy.

Icons come from Font Awesome Free 6.5.1 (CC BY 4.0) and are inlined as symbols in `assets/icons.svg`.

## Design system

Colors, spacing, radii and type scale live as custom properties at the top of `assets/css/style-new.css`.

| Token | Value | Use |
|---|---|---|
| `--black` | `#06020A` | Page background |
| `--aqua` | `#00E8FF` | Primary accent |
| `--persian-rose` | `#FC109C` | Secondary accent |
| `--veronica` | `#A52AFF` | Tertiary accent |
| `--aureolin` | `#FFE800` | Highlight |

Fonts: Outfit for headings, DM Sans for body, Montserrat for display, Roboto Mono for the terminal styling in the SHARD section.

## Accessibility

Both pages score 100 on the Lighthouse accessibility category. Specifics worth knowing when editing:

- Elements that are not available yet are `<button disabled>` or plain `<span>`, never `<a href="#">`. An anchor to `#` is focusable, activates on Enter and jumps to the top of the page, which reads as a broken link.
- Disabled controls carry no `opacity`, because dimming the element drops its label under the contrast minimum. Use a muted color token instead.
- Scroll reveal is opt-in through `data-animate`, and `main-new.js` sets those attributes before `ScrollAnimations` reads them. Reversing that order leaves the whole page at `opacity: 0`.
- The page loader is hidden outright by a `<noscript>` style block, so a script failure cannot leave the site behind a spinner.

## Service worker

`sw.js` precaches the shell and serves assets stale-while-revalidate, so a deploy reaches returning visitors on their next navigation. Navigations are network-first and fall back to `offline.html`.

Bump `CACHE_VERSION` in `sw.js` whenever a precached file changes.

## Known debt

- `assets/css/style-new.css` carries two generations of styles. 107 duplicated selectors were merged after proving the merge left every computed style on both pages unchanged. The 54 that remain cannot be merged mechanically without changing the rendering, so they need a manual pass.
- The SHARD section styles its own palette in raw hex (`#ff0040`, `#00ffff`) rather than the shared tokens. It is a deliberate homage, but it means that section does not follow a theme change.
- No contact route is published anywhere on the site. Every "get in touch" path is a disabled button.

## Deployment

Any static host. `_headers` uses the Netlify and Cloudflare Pages format; on other hosts the same headers need to be configured through that host's own mechanism.

No environment variables, no server-side code.

## License

`package.json` declares MIT. No LICENSE file is committed yet, so that declaration is currently unbacked. Add one before the repo goes public.
