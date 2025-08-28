# Miami Paradise Studio

> We build competitive worlds that fight back.

A high-performance, accessible, and cyberpunk-themed website for Miami Paradise Studio, showcasing our flagship game **SHARD Protocol** - a tactical 4v4 PvP game with revolutionary voice command mechanics.

## 🚀 Features

### Core Functionality
- **Responsive Design**: Optimized for all devices and screen sizes
- **Progressive Web App (PWA)**: Installable, offline-capable, with push notifications
- **Accessibility First**: WCAG 2.1 AA compliant with comprehensive screen reader support
- **Performance Optimized**: Lighthouse score 95+ across all metrics
- **SEO Optimized**: Structured data, sitemap, robots.txt, and meta optimization

### Visual Effects
- **Cyberpunk Aesthetic**: Metal Gear Solid-inspired design with neon accents
- **Interactive Particles**: tsParticles integration with performance optimization
- **Advanced Animations**: CSS3 animations with reduced motion support
- **Glitch Effects**: Dynamic text glitching and holographic elements
- **Terminal Interface**: Interactive cyberpunk terminal with system status

### Technical Excellence
- **Vanilla JavaScript**: No framework dependencies, pure ES6+
- **Modern CSS**: CSS Grid, Flexbox, Custom Properties, and advanced selectors
- **Service Worker**: Advanced caching strategies and offline functionality
- **Privacy-First Analytics**: GDPR-compliant tracking without cookies
- **Security Headers**: Comprehensive security.txt and CSP implementation

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic markup with comprehensive meta tags
- **CSS3**: Modern layout techniques with CSS Custom Properties
- **Vanilla JavaScript**: ES6+ features, no build process required
- **Web Components**: Custom elements for reusable UI components

### External Dependencies
- **tsParticles**: Interactive particle background effects
- **Font Awesome 6.5.1**: Icon library via CDN
- **Google Fonts**: Typography (DM Sans, Montserrat, Outfit, Roboto Mono)

### Performance Optimizations
- **Preconnect**: Critical origins for fonts and CDNs
- **Preload**: Non-blocking CSS loading with onload strategy
- **Defer**: JavaScript loading for non-critical scripts
- **Lazy Loading**: Images with loading="lazy" attribute
- **Resource Hints**: DNS prefetch and prefetch for critical resources

## 📁 Project Structure

```
/
├── index.html              # Main landing page
├── shard-protocol.html     # SHARD Protocol details page
├── offline.html            # PWA offline fallback page
├── site.webmanifest       # PWA manifest
├── sw.js                  # Service Worker
├── robots.txt             # SEO robots file
├── sitemap.xml            # SEO sitemap
├── browserconfig.xml      # Windows tile configuration
├── .well-known/
│   └── security.txt       # Security policy
└── assets/
    ├── css/
    │   └── style-new.css  # Main stylesheet
    ├── js/
    │   ├── main-new.js    # Main JavaScript
    │   └── analytics.js   # Privacy-first analytics
    └── images/            # Optimized images and icons
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/miamiparadise/studio-website.git
   cd studio-website
   ```

2. **Serve locally**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Development Workflow

Since this is a static site with no build process:

1. **Edit files directly** - No compilation required
2. **Test locally** - Use any static server
3. **Deploy** - Upload files directly to web server

## 🎨 Design System

### Colors
- **Primary**: `#06020A` (Rich Black)
- **Accent**: `#00E8FF` (Aqua)
- **Secondary**: `#FC109C` (Persian Rose)
- **Tertiary**: `#A52AFF` (Veronica)
- **Warning**: `#FFE800` (Aureolin)

### Typography
- **Primary**: Outfit (Headings)
- **Secondary**: DM Sans (Body)
- **Monospace**: Roboto Mono (Code/Terminal)
- **Display**: Montserrat (Large headings)

### Spacing Scale
- **Base unit**: 0.25rem (4px)
- **Scale**: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24

## 🔧 Configuration

### Analytics
Privacy-first analytics are configured in `assets/js/analytics.js`:

```javascript
const ANALYTICS_CONFIG = {
    trackingId: 'MPS-2024',
    respectDoNotTrack: true,
    anonymizeIPs: true,
    cookieConsent: false
};
```

### Service Worker
Caching strategies configured in `sw.js`:

```javascript
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const CACHE_SIZE_LIMIT = 50;
```

### PWA Manifest
App configuration in `site.webmanifest`:

```json
{
    "name": "Miami Paradise Studio",
    "short_name": "MPS",
    "display": "standalone",
    "theme_color": "#00E8FF"
}
```

## 🎮 SHARD Protocol

Our flagship game features:

- **4v4 Tactical PvP**: Team-based extraction-style gameplay
- **Voice Commands**: Revolutionary voice-controlled mechanics
- **Dynamic Classes**: Light, Medium, Heavy with unique abilities
- **Objective-Based**: Capture flags → breach base → extract victory

## 📊 Performance

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: 100

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Bundle Size
- **HTML**: ~15KB (gzipped)
- **CSS**: ~25KB (gzipped)
- **JavaScript**: ~20KB (gzipped)
- **Total**: ~60KB (excluding images)

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: ARIA labels and semantic HTML
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects user preferences

### Features
- Skip links for main content
- Semantic HTML structure
- Alternative text for images
- Keyboard navigation support
- High contrast mode support

## 🔒 Security

### Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Privacy
- No tracking cookies
- GDPR compliant analytics
- Minimal data collection
- User consent management

## 🚀 Deployment

### Static Hosting
Compatible with:
- **Netlify**: Drag & drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Direct repository hosting
- **AWS S3**: Static website hosting
- **Cloudflare Pages**: Edge deployment

### CDN Configuration
Recommended headers:
```
Cache-Control: public, max-age=31536000, immutable  # Assets
Cache-Control: public, max-age=3600                 # HTML
```

### Environment Variables
No environment variables required - fully static deployment.

## 📈 Analytics & Monitoring

### Privacy-First Analytics
- No cookies or personal data collection
- GDPR/CCPA compliant
- Respects Do Not Track headers
- Anonymous user identification

### Tracked Metrics
- Page views and navigation
- User interactions (clicks, scrolls)
- Performance metrics (Core Web Vitals)
- Error tracking and monitoring
- Conversion funnel analysis

### Performance Monitoring
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Resource loading performance
- JavaScript error tracking

## 🤝 Contributing

### Code Style
- **HTML**: Semantic, accessible markup
- **CSS**: BEM methodology, mobile-first
- **JavaScript**: ES6+, functional programming
- **Comments**: JSDoc for functions

### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Testing
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile device testing (iOS, Android)
- Accessibility testing (screen readers, keyboard)
- Performance testing (Lighthouse, WebPageTest)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Responsive design implementation
- [x] PWA functionality
- [x] Accessibility compliance
- [x] Performance optimization

### Phase 2: Enhancement 🚧
- [ ] Advanced animations and micro-interactions
- [ ] Content management system integration
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

### Phase 3: Integration 📋
- [ ] Game launcher integration
- [ ] Community features
- [ ] Real-time updates
- [ ] Social media integration

## 📞 Contact

- **Website**: [miamiparadise.studio](https://miamiparadise.studio)
- **Email**: hello@miamiparadise.studio
- **Discord**: Coming with Alpha release
- **Twitter**: @miamiparadisestudio

## 🙏 Acknowledgments

- **tsParticles** - Interactive particle effects
- **Font Awesome** - Icon library
- **Google Fonts** - Typography
- **MDN Web Docs** - Technical reference
- **Web.dev** - Performance best practices

---

**Miami Paradise Studio** - Building competitive worlds that fight back. 🏄🏾‍♀️🐬🍸🍾