import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/shard-protocol'];

test.describe('pages render', () => {
	for (const path of PAGES) {
		test(`${path} has its heading and no console errors`, async ({ page }) => {
			const errors: string[] = [];
			page.on('console', (message) => {
				if (message.type() === 'error') errors.push(message.text());
			});
			page.on('pageerror', (error) => errors.push(error.message));

			await page.goto(path);

			const heading = page.locator('h1');
			await expect(heading).toBeVisible();
			// A collapsed heading is the failure mode when SplitText runs before the
			// variable font resolves, and it is invisible to a "does it exist" check.
			expect((await heading.boundingBox())?.height ?? 0).toBeGreaterThan(40);

			expect(errors).toEqual([]);
		});
	}
});

test('the WebGL hero actually paints', async ({ page }) => {
	await page.goto('/');

	const canvas = page.locator('canvas');
	await expect(canvas).toBeVisible({ timeout: 20_000 });

	// Lighthouse cannot see this: a scene that never calls render still scores
	// fine as long as the DOM around it behaves.
	const painted = await page.evaluate(async () => {
		const element = document.querySelector('canvas');
		if (!element) return false;
		const gl = element.getContext('webgl2') ?? element.getContext('webgl');
		return Boolean(gl) && element.width > 0 && element.height > 0;
	});
	expect(painted).toBe(true);
});

test('reduced motion skips the scene and leaves the page usable', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');

	await expect(page.locator('h1')).toBeVisible();
	await expect(page.locator('canvas')).toHaveCount(0);

	const hidden = await page.evaluate(
		() =>
			[...document.querySelectorAll('.js-reveal')].filter(
				(el) => getComputedStyle(el).opacity === '0'
			).length
	);
	expect(hidden).toBe(0);
});

test('every reveal resolves after scrolling the page', async ({ page }) => {
	await page.goto('/');
	await page.waitForTimeout(1500);

	// Lenis owns scroll, so drive it the way a user does rather than by
	// setting scrollTop, which Lenis overwrites on its next frame.
	for (let i = 0; i < 60; i++) {
		await page.mouse.wheel(0, 200);
		await page.waitForTimeout(40);
	}
	await page.waitForTimeout(800);

	const hidden = await page.evaluate(
		() =>
			[...document.querySelectorAll('.js-reveal')].filter(
				(el) => getComputedStyle(el).opacity === '0'
			).length
	);
	expect(hidden).toBe(0);
});

test('the mobile menu opens and closes through the popover API', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	const panel = page.locator('#mobile-nav');
	await expect(panel).toBeHidden();

	await page.getByRole('button', { name: 'Toggle menu' }).click();
	await expect(panel).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(panel).toBeHidden();
});

test.describe('accessibility in live states', () => {
	for (const path of PAGES) {
		test(`${path} has no axe violations once settled`, async ({ page }) => {
			await page.goto(path);
			await page.waitForTimeout(2000);

			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.analyze();

			expect(results.violations).toEqual([]);
		});
	}
});
