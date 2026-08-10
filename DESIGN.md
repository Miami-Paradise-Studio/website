# Design system

## Theme

Dark. Forced by the scene: a scout or an investor opening this at 1am as one tab among ten, in a dark room, deciding in four seconds whether to keep scrolling. The page has to feel like the world of the game, and that world is night.

Not black. The ground is a humid indigo, the colour of a Miami sky that never fully darkens because the city is lit from below.

## Colour

Strategy: **committed**. One saturated hue carries the surface, with a second as signal. The reference is a sodium-vapour street lamp against a storm-lit sky, not a neon sign against black.

The category reflex here is cyan on black. Every cyberpunk page does it. The deliberate departure is **sodium amber**: the colour real streets are lit by, and the colour of the amber phosphor CRTs that military terminals actually used before green became the movie shorthand. Amber is what makes this page not look like the other ones.

All colours are OKLCH. Chroma drops as lightness approaches the extremes. No pure black, no pure white; every neutral is tinted toward the violet ground.

| Token | Value | Role |
|---|---|---|
| `--ink-000` | `oklch(0.09 0.022 295)` | Deepest ground, page base |
| `--ink-050` | `oklch(0.13 0.028 295)` | Raised surfaces |
| `--ink-100` | `oklch(0.18 0.032 295)` | Panels, wells |
| `--ink-200` | `oklch(0.26 0.034 295)` | Hairlines, dividers |
| `--rose` | `oklch(0.68 0.25 350)` | Committed accent, primary action |
| `--amber` | `oklch(0.80 0.16 72)` | Signal: live status, terminal, focus |
| `--aqua` | `oklch(0.84 0.13 205)` | Cool counterpoint, links, data |
| `--violet` | `oklch(0.58 0.23 300)` | Depth, gradients in the ground only |
| `--paper` | `oklch(0.97 0.008 295)` | Primary text |
| `--paper-dim` | `oklch(0.76 0.02 295)` | Secondary text |
| `--paper-mute` | `oklch(0.62 0.022 295)` | Tertiary, labels, disabled |

Aqua is demoted from its previous role. It was carrying headlines, borders, glows and body text at once, which flattened the page into a single hue. It is now a counterpoint only.

Gradients live in the ground and in decoration. Never in text.

## Typography

Two families, both variable, both self-hosted, latin subset.

**Archivo** (`wght 400..900`, `wdth 62..125`) carries everything except labels. The width axis is the point: headlines run expanded (`wdth 118`, `wght 850`) so they read as marquee lettering, body runs normal, and cramped UI runs condensed. One file, three voices.

**Martian Mono** (`wght 300..700`, `wdth 75..112.5`) is the instrument face. Status readouts, phase durations, tactical labels, the SHARD section. Mono is earned here: the product is a voice-command tactical game whose whole fiction is readouts. It is never used for body copy.

Scale: perfect fourth (1.333), fluid via `clamp()`.

| Step | Size | Use |
|---|---|---|
| `--fs-1` | 0.8125rem | Labels, captions |
| `--fs-0` | 1rem | Body |
| `--fs-1` | 1.333rem | Lead paragraph |
| `--fs-2` | 1.777rem | Card and phase titles |
| `--fs-3` | 2.369rem | Section headings |
| `--fs-4` | 3.157rem | Page headings |
| `--fs-5` | clamp to 5.6rem | Hero |
| `--fs-6` | clamp to 8rem | Display, SHARD wordmark |

Body line length is capped at 68ch. Line height is 1.65 on dark ground, raised from a light-background 1.55 because light type on dark reads lighter than it is.

## Layout

Left-aligned and asymmetric, not centered stacks. The grid is a 12-column field with a wide gutter; sections deliberately break it.

Cards are used only where the content is genuinely a set of peers (the three classes, the three voice systems). Process steps are a numbered editorial list, the roadmap is a spine with a live marker, and press facts are a specification table. Repeating one card shape down the whole page is what made the previous version read as a template.

Spacing varies on purpose: 8rem between narrative sections, 1.5rem inside a group. Even spacing everywhere is monotony.

## Motion

Native CSS scroll-driven animation (`animation-timeline: view()`), with an IntersectionObserver fallback for browsers without it. Reveals are short (320ms), staggered by 60ms within a group, and ease with `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo). No bounce, no elastic, no layout properties animated.

Cross-page navigation uses the View Transitions API so the header and the wordmark persist between the two pages.

Everything decorative stops under `prefers-reduced-motion`, and the reveal state resolves to visible rather than hidden.

## Bans carried from the register

No gradient text. No glassmorphism as a default surface. No identical card grids repeated down the page. No big-number hero stat row. No side-stripe accent borders. No em dashes in copy.
