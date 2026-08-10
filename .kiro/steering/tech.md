# Technology Stack

## Core Technologies
- **HTML5**: semantic, accessible markup
- **CSS3**: custom properties, grid and flexbox
- **Vanilla JavaScript**: ES2023, no framework
- **Static site**: no build process, files are served as written

## Dependencies
The site ships zero runtime dependencies from other origins. Everything is vendored:

- **tsParticles 2.12.0**: `assets/js/vendor/tsparticles.bundle.min.js`
- **Font Awesome Free 6.5.1 icons** (CC BY 4.0): inlined as symbols in `assets/icons.svg`
- **Fonts** (DM Sans, Montserrat, Outfit, Roboto Mono): `assets/fonts/*.woff2`, latin subset

`package.json` dependencies are dev tooling only: eslint, stylelint, html-validate, serve.

## Performance approach
- Self-hosted fonts with `font-display: swap`, preloaded for the two families used above the fold
- Deferred scripts
- An SVG sprite instead of an icon font, which removed roughly 290 KB of webfont payload
- Decorative particle effects gated on `prefers-reduced-motion` and on an IntersectionObserver, so they stop when off screen
- Cache policy in `_headers`: short TTL with revalidation for CSS and JS (filenames are not content-hashed), one year for fonts

## Security
`_headers` sets a `default-src 'self'` Content Security Policy, HSTS, `frame-ancestors 'none'`, Referrer-Policy and Permissions-Policy. `script-src` has no `'unsafe-inline'`, so no inline event handlers or inline scripts may be added. `style-src` still allows inline styles because the pages use style attributes.

## Development
```bash
npm install
npm start        # http://localhost:8000
npm test         # html-validate + stylelint + eslint
```

Clear the service worker when testing local edits, otherwise cached assets are served.

## Browser support
Modern browsers with ES2023, CSS grid, custom properties, `aspect-ratio` and external SVG `<use>`. No transpilation, no polyfills.
