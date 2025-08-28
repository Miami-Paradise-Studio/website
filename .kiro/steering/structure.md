# Project Structure

## Directory Organization
```
/
├── index.html              # Main landing page
├── site.webmanifest       # PWA manifest
├── .gitignore             # Git ignore rules
├── .kiro/                 # Kiro AI assistant configuration
│   └── steering/          # AI guidance documents
└── assets/                # Static assets
    ├── css/
    │   └── style.css      # Main stylesheet
    ├── js/
    │   └── main.js        # Main JavaScript
    └── images/            # All image assets
        ├── favicon files  # Various favicon formats
        └── brand assets   # Logos and graphics
```

## File Naming Conventions
- **HTML**: Single `index.html` for landing page
- **CSS**: Single `style.css` with all styles
- **JavaScript**: Single `main.js` with all functionality
- **Images**: Descriptive names, web-optimized formats
- **Favicons**: Standard naming (favicon.ico, apple-touch-icon.png, etc.)

## Code Organization Principles
- **Single Page Application**: All content in one HTML file
- **Component-based CSS**: Organized by sections (hero, about, methodology, etc.)
- **Modular JavaScript**: IIFE pattern to avoid global scope pollution
- **Semantic HTML**: Proper heading hierarchy, ARIA labels, accessibility

## Asset Management
- All static assets in `/assets/` directory
- Images optimized for web (PNG for icons, appropriate sizing)
- External resources loaded via CDN with integrity checks
- Local assets referenced with relative paths

## Accessibility Standards
- Semantic HTML structure
- ARIA labels and roles
- Screen reader support
- Keyboard navigation
- Color contrast compliance
- Alternative text for images