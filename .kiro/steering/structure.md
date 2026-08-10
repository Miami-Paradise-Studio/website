# Project Structure

```
/
├── astro.config.mjs        # integrations, fonts, CSP
├── tsconfig.json
├── package.json
├── PRODUCT.md              # audience, tone, anti-references
├── DESIGN.md               # palette, type, layout, motion decisions
├── src/
│   ├── pages/              # one file per route
│   │   ├── index.astro
│   │   └── shard-protocol.astro
│   ├── layouts/
│   │   └── Layout.astro    # document head, meta, JSON-LD, header and footer
│   ├── components/
│   │   ├── Header.astro    # zero-JS except the mobile toggle
│   │   ├── Footer.astro
│   │   ├── Icon.astro      # <use> against the sprite
│   │   └── HeroScene.tsx   # the only React island
│   ├── lib/
│   │   └── motion.ts       # Lenis, ScrollTrigger, SplitText, SW registration
│   ├── styles/
│   │   └── global.css      # Tailwind entry, @theme tokens, bespoke effects
│   └── assets/fonts/       # variable woff2, read by Astro's Fonts API
└── public/                 # copied verbatim, never processed
    ├── _headers            # security and cache headers
    ├── sw.js
    ├── offline.html
    ├── robots.txt
    ├── site.webmanifest
    ├── .well-known/security.txt
    └── assets/             # icons.svg sprite, images
```

## Conventions
- **Design tokens live in one place**: the `@theme` block in `src/styles/global.css`. They become both CSS variables and Tailwind utilities. Do not hardcode a colour anywhere else.
- **Astro components by default.** Reach for a React island only when the thing genuinely needs client state, and mount it with the narrowest directive that works.
- **Icons**: add a `<symbol>` to `public/assets/icons.svg` and reference it through `Icon.astro`. No icon font.
- **Anything in `public/` is served as written.** Files that need processing belong in `src/assets/`.

## Editing rules
- `HeroScene` mounts with `client:idle`. It renders `null` until its boot gate opens, so `client:visible` would observe a zero-height placeholder and never fire.
- Headings split only after `document.fonts.ready`, otherwise the line boxes collapse.
- A heading that gets split carries `aria-label`; its generated lines are `aria-hidden`.
- Bump `CACHE_VERSION` in `public/sw.js` when a shell URL changes.
- Run `npm test` before committing, and check `npm run preview` rather than `dev` when touching anything that CSP could break.
