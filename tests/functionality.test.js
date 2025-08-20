const { test, expect } = require('@playwright/test');

test.describe('Functionality Tests', () => {
  test('should load the main page successfully', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Miami Paradise Studio/);
    await expect(page.locator('h1')).toContainText('We Don\'t Gamble on Games');
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test internal navigation links
    const aboutLink = page.locator('a[href="#about"]');
    const methodologyLink = page.locator('a[href="#methodology"]');
    const joinLink = page.locator('a[href="#join"]');
    
    await expect(aboutLink).toBeVisible();
    await expect(methodologyLink).toBeVisible();
    await expect(joinLink).toBeVisible();
    
    // Test clicking navigation links scrolls to sections
    await aboutLink.click();
    await expect(page.locator('#about')).toBeInViewport();
    
    await methodologyLink.click();
    await expect(page.locator('#methodology')).toBeInViewport();
    
    await joinLink.click();
    await expect(page.locator('#join')).toBeInViewport();
  });

  test('should validate email form input', async ({ page }) => {
    await page.goto('/');
    
    const emailInput = page.locator('#emailaddress');
    const submitButton = page.locator('button[type="submit"]');
    const errorElement = page.locator('#email-error');
    
    // Test empty email validation
    await submitButton.click();
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText('Email address cannot be empty');
    
    // Test invalid email format
    await emailInput.fill('invalid-email');
    await submitButton.click();
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText('Check the email address format');
    
    // Test valid email format (will fail at API call, but validation should pass)
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    // Should show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText('Submitting...');
  });

  test('should handle form submission gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock the API response to test success flow
    await page.route('/api/subscribe', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Subscription successful' })
      });
    });
    
    const emailInput = page.locator('#emailaddress');
    const submitButton = page.locator('button[type="submit"]');
    const responseElement = page.locator('#responseMessage');
    
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    // Should clear input and show success message
    await expect(emailInput).toHaveValue('');
    await expect(responseElement).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock API error response
    await page.route('/api/subscribe', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    const emailInput = page.locator('#emailaddress');
    const submitButton = page.locator('button[type="submit"]');
    const errorElement = page.locator('#email-error');
    
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    // Should show error message and re-enable button
    await expect(errorElement).toBeVisible();
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toContainText('Request Access');
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.features-grid')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.features-grid')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.features-grid')).toBeVisible();
  });

  test('should load external resources with fallbacks', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads even if external resources fail
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify particle system handles errors gracefully
    const particlesContainer = page.locator('#tsparticles');
    if (await particlesContainer.count() > 0) {
      // Particles should either load or be hidden on error
      const isVisible = await particlesContainer.isVisible();
      if (!isVisible) {
        const display = await particlesContainer.evaluate(el => getComputedStyle(el).display);
        expect(display).toBe('none');
      }
    }
  });

  test('should set current year dynamically', async ({ page }) => {
    await page.goto('/');
    
    const yearElement = page.locator('#current-year');
    const currentYear = new Date().getFullYear().toString();
    
    await expect(yearElement).toHaveText(currentYear);
  });
});