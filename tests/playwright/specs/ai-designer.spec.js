import { test, expect } from '@playwright/test';
import { auth, a11y } from '../helpers';

test.describe('AI Page Designer', () => {
  test.beforeEach(async ({ page }) => {
    await auth.navigateToAdminPage(page, 'admin.php?page=web#/ai-designer');
    await page.waitForSelector('#wppw-app-rendered', { timeout: 15000 });
    await page.waitForSelector('#nfd-ai-page-designer-mount', { timeout: 15000 });
    await expect(
      page.locator('#nfd-ai-page-designer-mount').getByText('AI Page Designer', {
        exact: false,
      })
    ).toBeVisible({ timeout: 20000 });
  });

  test('route and shell render', async ({ page }) => {
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toBe('#/ai-designer');

    await expect(page.locator('#wppw-app-rendered')).toBeVisible();
    await expect(page.locator('.wppw-ai-designer-wrapper')).toBeVisible();
    await expect(page.locator('#nfd-ai-page-designer-mount')).toBeVisible();

    const mount = page.locator('#nfd-ai-page-designer-mount');
    await expect(
      mount
        .getByRole('button', { name: /create new/i })
        .or(mount.getByRole('link', { name: /create new/i }))
    ).toBeVisible();
  });

  test('Dashboard tab shows intelligence canvas and content lists', async ({
    page,
  }) => {
    const mount = page.locator('#nfd-ai-page-designer-mount');

    await expect(mount.getByText('AI Page Designer')).toBeVisible();

    const navBtn = mount.locator('.ai-designer-header__nav-btn');
    const dashboardTab = navBtn.filter({ hasText: /^Dashboard$/i });
    const designerTab = navBtn.filter({ hasText: /^Designer$/i });
    await expect(dashboardTab).toBeVisible();
    await expect(designerTab).toBeVisible();

    await expect(
      mount.getByRole('heading', { name: /create new page with ai/i })
    ).toBeVisible();
    await expect(
      mount.getByText(/leverage ai to generate/i)
    ).toBeVisible();

    const generate = mount.locator('.ai-hero__generate-btn');
    await expect(generate).toBeVisible();

    await expect(mount.getByText(/^Pages$/)).toBeVisible();
    await expect(mount.getByText(/^Posts$/)).toBeVisible();
  });

  test('Designer tab shows chat, preview, and prompt controls', async ({
    page,
  }) => {
    const mount = page.locator('#nfd-ai-page-designer-mount');

    await mount.getByRole('tab', { name: /^Designer$/i }).click();

    await expect(
      mount.getByRole('tab', { name: /^Designer$/i })
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      mount.getByRole('tab', { name: /^Dashboard$/i })
    ).toHaveAttribute('aria-selected', 'false');

    await expect(mount.getByText(/^AI Chat$/)).toBeVisible();
    await expect(mount.getByText(/^Preview$/)).toBeVisible();

    await expect(
      mount.getByText(/describe the page you'd like to create/i)
    ).toBeVisible();
    await expect(
      mount.getByText(/publish directly to wordpress/i)
    ).toBeVisible();
    await expect(
      mount.getByText(/live preview will appear here/i)
    ).toBeVisible();

    const bottomPrompt = mount.getByPlaceholder(/describe your design idea/i);
    await expect(bottomPrompt).toBeVisible();
    await expect(bottomPrompt).toBeEnabled();

    const sendControl = mount
      .getByRole('button', { name: /send|submit/i })
      .or(
        mount
          .locator('div:has(textarea[placeholder*="Describe your design"])')
          .locator('button')
          .first()
      );
    await expect(sendControl).toBeVisible();

    await expect(mount.getByText(/^Try:$/)).toBeVisible();
    const trySuggestion = mount.getByRole('button', {
      name: /create a modern homepage/i,
    });
    await expect(trySuggestion).toBeVisible();
    await expect(trySuggestion).toBeEnabled();
  });

  test('tab switching between Dashboard and Designer', async ({ page }) => {
    const mount = page.locator('#nfd-ai-page-designer-mount');

    await expect(
      mount.getByRole('heading', { name: /create new page with ai/i })
    ).toBeVisible();

    await mount.getByRole('tab', { name: /^Designer$/i }).click();
    await expect(
      mount.getByText(/live preview will appear here/i)
    ).toBeVisible();
    await expect(
      mount.getByRole('heading', { name: /create new page with ai/i })
    ).not.toBeVisible();

    await mount.getByRole('tab', { name: /^Dashboard$/i }).click();
    await expect(
      mount.getByRole('tab', { name: /^Dashboard$/i })
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      mount.getByRole('heading', { name: /create new page with ai/i })
    ).toBeVisible();
    await expect(mount.getByPlaceholder(/search pages/i)).toBeVisible();
  });

  test('Is Accessible', async ({ page }) => {
    await a11y.checkA11y(page, '.wppw-ai-designer-wrapper');
  });
});
