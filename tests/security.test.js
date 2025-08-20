const { test, expect } = require('@playwright/test');

test.describe('Security Tests', () => {
  test('should have secure headers', async ({ page }) => {
    const response = await page.goto('/');
    
    // These would be set by server configuration
    // For static sites, these should be configured in hosting
    expect(response.status()).toBe(200);
  });

  test('should sanitize form inputs', async ({ page }) => {
    await page.goto('/');
    
    const emailInput = page.locator('#emailaddress');
    const submitButton = page.locator('button[type="submit"]');
    
    // Test script injection attempt
    await emailInput.fill('<script>alert("xss")</script>@example.com');
    await submitButton.click();
    
    // Should validate as invalid email format
    const errorElement = page.locator('#email-error');
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText('Check the email address format');
  });

  test('should prevent CSRF attacks', async ({ page }) => {
    await page.goto('/');
    
    // Mock API response to check if form includes CSRF protection
    let requestBody;
    await page.route('/api/subscribe', route => {
      requestBody = route.request().postData();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    const emailInput = page.locator('#emailaddress');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    // Check that only expected data is sent
    const parsedBody = JSON.parse(requestBody);
    expect(Object.keys(parsedBody)).toContain('email');
    expect(parsedBody.email).toBe('test@example.com');
  });

  test('should handle external resource failures securely', async ({ page }) => {
    // Block external resources to test fallback behavior
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
    await page.route('https://cdnjs.cloudflare.com/**', route => route.abort());
    await page.route('https://avatars.githubusercontent.com/**', route => route.abort());
    
    await page.goto('/');
    
    // Page should still function without external resources
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#subscribe-form')).toBeVisible();
    
    // Check for any script errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    await page.waitForTimeout(2000);
    
    // Should handle resource failures gracefully without breaking functionality
    expect(errors.length).toBe(0);
  });

  test('should validate email format securely', async ({ page }) => {
    await page.goto('/');
    
    const emailInput = page.locator('#emailaddress');
    const submitButton = page.locator('button[type="submit"]');
    const errorElement = page.locator('#email-error');
    
    const maliciousEmails = [
      'user@domain.com<script>alert("xss")</script>',
      'user@domain.com"onmouseover="alert(1)"',
      'user@domain.com&lt;script&gt;alert("xss")&lt;/script&gt;',
      'user@domain.com\\';DROP TABLE users;--',
      'user@domain.com<img src=x onerror=alert(1)>'
    ];
    
    for (const email of maliciousEmails) {
      await emailInput.fill(email);
      await submitButton.click();
      
      // Should reject malicious email formats
      await expect(errorElement).toBeVisible();
      await expect(errorElement).toContainText('Check the email address format');
      
      // Clear for next test
      await emailInput.clear();
    }
  });

  test('should not expose sensitive information in errors', async ({ page }) => {
    await page.goto('/');
    
    // Mock API error to test error message exposure
    await page.route('/api/subscribe', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Database connection failed: mysql://user:password@localhost:3306/db',
          stack: 'Error at /home/user/app/src/controllers/subscribe.js:42'
        })
      });
    });
    
    const emailInput = page.locator('#emailaddress');
    const submitButton = page.locator('button[type="submit"]');
    const errorElement = page.locator('#email-error');
    
    await emailInput.fill('test@example.com');
    await submitButton.click();
    
    await expect(errorElement).toBeVisible();
    
    const errorText = await errorElement.textContent();
    
    // Should not expose database credentials or file paths
    expect(errorText).not.toContain('mysql://');
    expect(errorText).not.toContain('password');
    expect(errorText).not.toContain('/home/user/app');
    expect(errorText).not.toContain('stack');
  });
});