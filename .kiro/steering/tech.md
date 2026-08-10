# Technology Stack

## Core
- **Astro 7** with `output: 'static'`. Islands architecture: a page that does not mount the 3D scene ships none of its JavaScript.
- **React 19** only inside islands. Everything else is plain Astro components with zero client JS.
- **Tailwind CSS 4** through `@tailwindcss/vite`. The `@astrojs/tailwind` integration is deprecated and must not be reintroduced.
- **TypeScript**, strict, checked by `astro check`.

## 3D and motion
- **three + @react-three/fiber + drei + @react-three/postprocessing** for the hero scene.
- **GSAP** (ScrollTrigger, SplitText) and **Lenis** for scroll choreography. The whole GSAP plugin set is free for commercial use.

## Version pinning
`react`, `react-dom` and `three` are pinned deliberately, not caret-ranged:

- `@react-three/fiber` peers `react >=19 <19.3`
- `@react-three/postprocessing` peers `react ^19.2.0`
- `postprocessing` peers `three < 0.186`

Check all three ranges before any bump. A plain `npm update` will break the install otherwise.

## Dependencies at runtime
None from another origin. Fonts, the icon sprite and every library are served from this domain, which is what lets the Content Security Policy stay at `default-src 'self'`.

## Security
`security.csp` in `astro.config.mjs` makes Astro emit a per-page `<meta>` CSP with a hash for every inline script and style. Consequences worth knowing:

- `<ClientRouter />` cannot be used; it is incompatible with CSP. Cross-page transitions come from the native `@view-transition` CSS rule instead, with Astro `prefetch` on hover.
- Extra script sources go in `security.csp.scriptDirective`, not in `directives`: Astro owns `script-src` because it injects a hash per inline script and rejects the directive being set by hand.
- Speculation Rules do not work here. With hashes in the policy Chrome refuses the inline rules block unless its own hash is listed, and that hash changes whenever the block does.
- `frame-ancestors` is ignored in a meta policy, so framing is denied by `X-Frame-Options` in `public/_headers`.
- CSP only exists in `build` and `preview` output. `dev` will not surface CSP breakage.

## Development
```bash
npm install      # Node >= 22.12
npm run dev      # http://localhost:4321
npm run build
npm run preview  # :8000, this is the one that has CSP
npm test         # astro check + stylelint
```

## Browser support
Modern browsers with ES2023, CSS nesting, `oklch()`, `color-mix()`, container queries and WebGL2. No transpilation targets beyond Astro's defaults, no polyfills. The site is designed to remain usable without WebGL and without JavaScript.
