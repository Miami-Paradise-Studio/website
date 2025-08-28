# Technology Stack

## Core Technologies
- **HTML5**: Semantic, accessible markup with comprehensive meta tags
- **CSS3**: Custom properties (CSS variables), modern layout techniques
- **Vanilla JavaScript**: ES6+ features, no framework dependencies
- **Static Site**: No build process, direct file serving

## External Dependencies
- **tsparticles**: Interactive particle background effects
- **Font Awesome 6.5.1**: Icon library via CDN
- **Google Fonts**: Typography (DM Sans, Montserrat, Outfit, Roboto Mono)

## Performance Optimizations
- **Preconnect**: Critical origins for fonts and CDNs
- **Preload**: Non-blocking CSS loading with onload strategy
- **Defer**: JavaScript loading for non-critical scripts
- **Lazy Loading**: Images with loading="lazy" attribute

## Development Workflow
Since this is a static site with no build process:

### Local Development
```cmd
# Serve locally (any static server)
python -m http.server 8000
# or
npx serve .
```

### Deployment
- Direct file upload to web server
- No compilation or build steps required
- Assets served directly from `/assets/` directory

## Browser Support
- Modern browsers supporting ES6+, CSS Grid, and CSS Custom Properties
- Progressive enhancement for older browsers via noscript fallbacks