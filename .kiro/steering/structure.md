# Project Structure

## Directory Organization
```
/
├── index.html              # Landing page
├── shard-protocol.html     # SHARD Protocol detail page
├── offline.html            # Service worker fallback, no scripts
├── site.webmanifest        # PWA manifest
├── sw.js                   # Service worker
├── robots.txt
├── sitemap.xml
├── _headers                # Security and cache headers
├── package.json            # Dev tooling only, the site ships no dependencies
├── eslint.config.mjs
├── .gitignore
├── .kiro/                  # Kiro AI assistant configuration
│   └── steering/           # AI guidance documents
├── .well-known/
│   └── security.txt
└── assets/
    ├── css/
    │   └── style-new.css   # The whole stylesheet
    ├── fonts/              # Self-hosted woff2, latin subset
    ├── icons.svg           # SVG sprite, referenced with <use href="...#i-name">
    ├── images/             # Favicons, logos, OG images, PWA screenshots
    └── js/
        ├── main-new.js     # All page behaviour
        └── vendor/         # Vendored third-party code
```

## Conventions
- **CSS**: one stylesheet, `style-new.css`. Design tokens are custom properties at the top of the file.
- **JavaScript**: one script, `main-new.js`, wrapped in an IIFE. One class per concern, all constructed in `init()`.
- **Icons**: no icon font. Add a `<symbol>` to `assets/icons.svg` and reference it with `<use>`.
- **Assets**: everything is served from this origin. Do not add a CDN reference.
- **Pages**: three HTML files, hand-written, no templating.

## Editing rules
- `main-new.js` sets `data-animate` attributes before constructing `ScrollAnimations`. Keep that order or the page renders at `opacity: 0`.
- Unavailable features are `<button disabled>` or `<span>`, never `<a href="#">`.
- Bump `CACHE_VERSION` in `sw.js` when a precached file changes.
- Run `npm test` before committing.
