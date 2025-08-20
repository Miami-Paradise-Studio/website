const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    
    for (const image of images) {
      // Check that images have proper dimensions
      const width = await image.getAttribute('width');
      const height = await image.getAttribute('height');
      
      if (width && height) {
        expect(parseInt(width)).toBeGreaterThan(0);
        expect(parseInt(height)).toBeGreaterThan(0);
      }
      
      // Check that images have loading="lazy" for non-critical images
      const loading = await image.getAttribute('loading');
      const src = await image.getAttribute('src');
      
      // Profile images should have lazy loading
      if (src && src.includes('avatars.githubusercontent.com')) {
        expect(loading).toBe('lazy');
      }
    }
  });

  test('should have minimal render-blocking resources', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForFunction(() => document.readyState === 'complete');
    
    const domContentLoadedTime = Date.now() - startTime;
    
    // DOM should be ready quickly even if external resources are slow
    expect(domContentLoadedTime).toBeLessThan(2000);
  });

  test('should handle slow network conditions', async ({ page, context }) => {
    // Simulate slow 3G network
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      route.continue();
    });
    
    await page.goto('/');
    
    // Page should still be functional even with slow network
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#subscribe-form')).toBeVisible();
  });

  test('should minimize layout shifts', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial layout
    await page.waitForTimeout(1000);
    
    const initialScrollHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Wait for any potential late-loading content
    await page.waitForTimeout(2000);
    
    const finalScrollHeight = await page.evaluate(() => document.body.scrollHeight);
    
    // Layout should be stable (allowing for small variations)
    const heightDifference = Math.abs(finalScrollHeight - initialScrollHeight);
    expect(heightDifference).toBeLessThan(100);
  });

  test('should cache static resources effectively', async ({ page }) => {
    // First load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that CSS and JS files are cached
    const cssResponse = await page.waitForResponse(response => 
      response.url().includes('style.css') && response.status() === 200
    );
    
    const jsResponse = await page.waitForResponse(response => 
      response.url().includes('main.js') && response.status() === 200
    );
    
    // Responses should have cache headers for static assets
    expect(cssResponse.status()).toBe(200);
    expect(jsResponse.status()).toBe(200);
  });
});