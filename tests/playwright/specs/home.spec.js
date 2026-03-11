import { test, expect } from '@playwright/test';
import { auth, a11y, utils } from '../helpers';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await auth.navigateToAdminPage(page, 'admin.php?page=web#/home');
  });

  test('Is Accessible', async ({ page }) => {
    // Wait for the home page to load - check for the main app container and home page class
    await page.waitForSelector('#wppw-app-rendered', { timeout: 10000 });
    await page.waitForSelector('.wppw-page-home', { timeout: 10000 });
    
    // Run accessibility test with WCAG 2.1 AA standards (includes color contrast)
    await a11y.checkA11y(page, '.wppw-app-body');
  });

 
  test('Home page UI elements are present and visible', async ({ page }) => {
    // Header
    const header = page.locator(
      '.wppw-app-home-container .wppw-app-home-header'
    );
    await expect(header).toBeVisible();

    // Main content
    const content = page.locator('.wppw-app-home-content');
    await expect(content).toBeVisible();

    // Settings section
    const settings = page.locator('.wppw-app-home-settings');
    await expect(settings).toBeVisible();

    // Settings actions (scoped inside settings)
    await expect(
      settings.locator('.wppw-app-home-settings-action')
    ).toBeVisible();

    await expect(
      settings.locator('.wppw-app-home-performance-action')
    ).toBeVisible();

    await expect(
      settings.locator('.wppw-app-home-marketplace-action')
    ).toBeVisible();

    // Hosting section
    const hosting = page.locator('.wppw-app-home-hosting');
    await expect(hosting).toBeVisible();

    // Manage Network Solutions Account link
    const manageAccountLink = hosting.locator(
      'a.nfd-button.nfd-button--secondary',
      { hasText: 'Manage Network Solutions Account' }
    );

    await expect(manageAccountLink).toBeVisible();

    await expect(manageAccountLink).toHaveAttribute(
      'href',
      /https:\/\/www\.networksolutions\.com\/my-account\/home/
    );
  });

});
