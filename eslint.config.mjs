import js from '@eslint/js';

export default [
	js.configs.recommended,
	{
		files: ['assets/js/**/*.js'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'script',
			globals: {
				window: 'readonly',
				document: 'readonly',
				navigator: 'readonly',
				console: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				requestAnimationFrame: 'readonly',
				IntersectionObserver: 'readonly',
				tsParticles: 'readonly'
			}
		},
		rules: {
			'prefer-const': 'error',
			'no-var': 'error'
		}
	},
	{
		files: ['sw.js'],
		languageOptions: {
			ecmaVersion: 2023,
			sourceType: 'script',
			globals: {
				self: 'readonly',
				caches: 'readonly',
				fetch: 'readonly',
				Response: 'readonly',
				URL: 'readonly',
				console: 'readonly'
			}
		},
		rules: {
			'prefer-const': 'error',
			'no-var': 'error'
		}
	}
];
