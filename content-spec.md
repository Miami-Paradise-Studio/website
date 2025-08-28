# Content Specification - Miami Paradise Studio

## Microcopy & Headlines (PL/EN)

### Hero Section
**EN:**
- Main: "We build competitive worlds that fight back."
- Sub: "Small, fast studio. Data-driven design. Brutal focus on fun and signal."
- CTA1: "See SHARD Protocol"
- CTA2: "Join Discord"

**PL:**
- Main: "Budujemy konkurencyjne światy, które stawiają opór."
- Sub: "Małe, szybkie studio. Projektowanie oparte na danych. Bezwzględny fokus na fun i sygnał."
- CTA1: "Zobacz SHARD Protocol"
- CTA2: "Dołącz na Discord"

### SHARD Protocol Section
**EN:**
- Title: "SHARD Protocol"
- Subtitle: "Team-based 4v4 extraction-style PvP: capture flags, breach the base, and silence the enemy — with tactical voice commands."
- Voice Commands: "SHIELD (cover), LOCAL (ping enemies), AIRSTRIKE (mark target), OVERDRIVE (speed boost), SHOCKWAVE (EMP silence)"
- Tactical: "Capture flags → breach enemy base. Objective-driven PvP with clear win conditions."
- Classes: "Light (mobility), Medium (balance), Heavy (area control). 3 weapons + 1 special ability each."
- CTA1: "Wishlist on Steam"
- CTA2: "Playtest Sign-up"

**PL:**
- Title: "SHARD Protocol"
- Subtitle: "Drużynowy PvP 4v4 w stylu extraction: przejmuj flagi, szturmuj bazę wroga i uciszaj przeciwników — za pomocą taktycznych komend głosowych."
- Voice Commands: "SHIELD (osłona), LOCAL (ping wrogów), AIRSTRIKE (oznacz cel), OVERDRIVE (przyspieszenie), SHOCKWAVE (wyciszenie EMP)"
- Tactical: "Przejmij flagi → szturmuj bazę wroga. PvP z jasnymi celami i warunkami zwycięstwa."
- Classes: "Light (mobilność), Medium (balans), Heavy (kontrola obszaru). 3 bronie + 1 umiejętność specjalna każda."

### About/Process Section
**EN:**
- Title: "Our Process"
- Subtitle: "Miami Paradise Studio = small, disciplined R&D team. We operate in Build-Measure-Learn cycles, developing ideas through Minimum Viable Experiments (MVE) to quickly gain validated learning and minimize risk."
- Process Cards:
  1. "Lean MVE Engine" - "Hypothesis → KPI → Experiment → Decision. Data beats opinions every time."
  2. "Actionable Metrics" - "D1 retention, funnel conversions, core loop completion. Green metrics = scale. Red = pivot or kill."
  3. "Parallel Marketing" - "Discord community, wishlists, social validation running alongside development cycles."
  4. "AI Acceleration" - "Aggressive use of AI and existing assets for faster time-to-signal. Speed matters."

**PL:**
- Title: "Nasz Proces"
- Subtitle: "Miami Paradise Studio = mały, zdyscyplinowany zespół R&D. Działamy w cyklach Build-Measure-Learn, rozwijając pomysły przez Minimum Viable Experiments (MVE) dla szybkiego zdobywania validated learning i minimalizacji ryzyka."

### Roadmap Section
**EN:**
- Title: "Development Roadmap"
- Subtitle: "Realistic phases with clear gates and metrics. No bullshit timelines."
- Phases:
  1. "Discovery & Pre-Production" (6-8 weeks) - "Research, fantasy, paper prototypes, greybox validation"
  2. "Vertical Slice" (8-12 weeks) - "Proven core loop + target quality slice. Voice commands MVP."
  3. "Alpha" (3-4 months) - "Feature-complete, balance pass, telemetry integration"
  4. "Beta" (2-3 months) - "Stabilization, content pass, network/anticheat testing"
  5. "Launch Window" (Based on metrics) - "Launch when quality and KPIs hit targets, not calendar dates"

**PL:**
- Title: "Roadmapa Rozwoju"
- Subtitle: "Realistyczne fazy z jasnymi bramkami i metrykami. Żadnych bzdurnych terminów."

### Investors Section
**EN:**
- Title: "Press & Investors"
- Studio: "Small team, fast decisions, low burn"
- Product: "SHARD Protocol: 4v4 tactical PvP", "USP: Voice command system", "Target: competitive gaming market"
- Process: "Validated learning cycles", "Clear KPI gates", "Fast pivot/kill decisions"
- CTAs: "Contact Us", "Download Deck", "Press Kit"

### Join Section
**EN:**
- Title: "Join the Fight"
- Subtitle: "Get early access, influence development, and connect with the community."
- Discord: "Daily updates, playtests, direct dev feedback"
- Newsletter: "Weekly progress, metrics, behind-the-scenes"
- Playtest: "First access to builds, shape the game"

## Animation Specifications

### Micro-interactions (≤300ms)
1. **Button Hover**: `transform: translateY(-2px)` + glow effect
2. **Card Hover**: `transform: translateY(-4px)` + border color change
3. **Nav Link Hover**: Background fade-in with aqua tint
4. **Logo Hover**: `transform: translateY(-1px)`

### Scroll Animations (Intersection Observer)
1. **Hero Content**: Fade up from bottom, staggered by 100ms
2. **Section Cards**: Fade up with slight scale (0.95 → 1.0)
3. **Roadmap Phases**: Slide in from left with 50ms stagger
4. **Process Cards**: Fade up with rotation (2deg → 0deg)

### SHARD Preview Interactions
1. **Voice Commands**: Cycle every 3s with pulse animation
2. **Objective Markers**: Update every 4.5s with fade transition
3. **HUD Elements**: Subtle glow and opacity changes

### Performance Constraints
- All animations respect `prefers-reduced-motion`
- 60fps target with `will-change` optimization
- CSS transforms only (no layout thrashing)
- Maximum duration: 350ms for micro-interactions

## Component Roadmap

### Reusable Blocks
1. **Hero Block** - Full-screen intro with CTA buttons
2. **Feature Grid** - 3-column responsive cards with icons
3. **Process Timeline** - Numbered steps with descriptions
4. **Roadmap Timeline** - Status-based phases with progress
5. **Contact Cards** - Action-oriented link cards
6. **Stats Block** - Metrics display with counters

### Design Tokens (JSON)
```json
{
  "colors": {
    "primary": "#00E8FF",
    "secondary": "#FC109C",
    "accent": "#A52AFF",
    "warning": "#FFE800",
    "background": "#06020A",
    "surface": "#080114",
    "text": {
      "primary": "#F5F5FF",
      "secondary": "#AEAEC5",
      "dim": "#8B8BA3"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem",
    "3xl": "4rem"
  },
  "typography": {
    "fontFamily": {
      "primary": "Outfit, sans-serif",
      "secondary": "DM Sans, sans-serif",
      "mono": "Roboto Mono, monospace",
      "display": "Montserrat, sans-serif"
    },
    "fontSize": {
      "xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
      "sm": "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)",
      "base": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
      "lg": "clamp(1.125rem, 1rem + 0.625vw, 1.375rem)",
      "xl": "clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem)",
      "2xl": "clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem)",
      "3xl": "clamp(2rem, 1.5rem + 2.5vw, 3.5rem)",
      "4xl": "clamp(2.5rem, 1.75rem + 3.75vw, 4.5rem)"
    }
  },
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "250ms",
      "slow": "350ms"
    },
    "easing": {
      "out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      "inOut": "cubic-bezier(0.4, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  }
}
```

## Performance & SEO Checklist

### Core Web Vitals
- [ ] LCP < 2.5s (mobile-first)
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTFB < 600ms

### Technical SEO
- [ ] Semantic HTML5 structure
- [ ] Open Graph meta tags for all pages
- [ ] Twitter Card meta tags
- [ ] Structured data (Organization, WebSite)
- [ ] XML sitemap
- [ ] robots.txt
- [ ] Canonical URLs

### Accessibility (WCAG 2.2 AA)
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] ARIA labels and roles
- [ ] Focus indicators
- [ ] Alternative text for images
- [ ] Reduced motion support

### Performance Optimizations
- [ ] Critical CSS inlined
- [ ] Non-critical CSS loaded asynchronously
- [ ] JavaScript deferred/async
- [ ] Image lazy loading
- [ ] WebP format with fallbacks
- [ ] Font display: swap
- [ ] Resource hints (preconnect, prefetch)
- [ ] Service worker for caching (optional)

### i18n Readiness
- [ ] `lang` attribute on html element
- [ ] Text externalized to JSON/config
- [ ] RTL layout considerations
- [ ] Date/number formatting
- [ ] URL structure for locales (/en/, /pl/)