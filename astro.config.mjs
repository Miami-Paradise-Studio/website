// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = 'https://miamiparadisestudio.tenzanlogic.com';

export default defineConfig({
	site,
	output: 'static',
	compressHTML: true,
	trailingSlash: 'never',

	integrations: [react(), sitemap()],

	// Warms the other page on pointer intent. Speculation Rules were tried and
	// dropped: with hashes in the policy Chrome rejects the inline rules block
	// unless its own hash is listed, and that hash breaks on every edit.
	prefetch: {
		prefetchAll: true,
		defaultStrategy: 'hover',
	},

	// Astro hashes every inline script and style it emits, so the policy needs no
	// 'unsafe-inline'. This is why the site does not use <ClientRouter />: the
	// client router is incompatible with CSP, and native cross-document view
	// transitions (declared in global.css) cover the same ground without JS.
	// frame-ancestors is absent on purpose: it is ignored in a <meta> CSP, so
	// framing is denied by X-Frame-Options in public/_headers instead.
	security: {
		csp: {
			algorithm: 'SHA-256',
			directives: [
				"default-src 'self'",
				"img-src 'self' data:",
				"font-src 'self'",
				"connect-src 'self'",
				"worker-src 'self'",
				"manifest-src 'self'",
				"object-src 'none'",
				"base-uri 'self'",
				"form-action 'self'",
			],
		},
	},

	vite: {
		plugins: [tailwindcss()],
	},

	// Local provider so nothing is fetched from a font CDN at build or at runtime.
	// Astro generates the metric-matched fallback, which is what removes swap CLS.
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Archivo',
			cssVariable: '--font-archivo',
			fallbacks: ['system-ui', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/Archivo-Variable.woff2'],
						weight: '400 900',
						style: 'normal',
						stretch: '62% 125%',
						display: 'swap',
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Martian Mono',
			cssVariable: '--font-martian',
			fallbacks: ['ui-monospace', 'monospace'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/MartianMono-Variable.woff2'],
						weight: '300 700',
						style: 'normal',
						stretch: '75% 112.5%',
						display: 'swap',
					},
				],
			},
		},
	],
});
