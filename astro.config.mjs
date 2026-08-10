// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = 'https://miamiparadise.studio';

export default defineConfig({
	site,
	output: 'static',
	compressHTML: true,
	trailingSlash: 'never',

	integrations: [react(), sitemap()],

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
