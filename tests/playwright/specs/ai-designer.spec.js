import { test, expect } from '@playwright/test';
import { auth, a11y, newfold } from '../helpers';

test.describe('AI Page Designer', () => {
  test.beforeEach(async ({ page }) => {
    await newfold.setCapability({
      canAccessAI: true,
      canAccessAIPageDesigner: true,
      hasAISiteGen: true,
    });
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
    await expect(mount.locator('.ai-btn--create-new')).toBeVisible();
  });

  test('Dashboard tab shows intelligence canvas and content lists', async ({
    page,
  }) => {
    const mount = page.locator('#nfd-ai-page-designer-mount');

    await expect(mount.getByText('AI Page Designer')).toBeVisible();

    const navBtn = mount.locator('.ai-designer-header__nav-btn');
    const dashboardTab = navBtn.filter({ hasText: /^Dashboard$/i });
    await expect(dashboardTab).toBeVisible();

    await expect(mount.locator('.ai-hero__heading')).toBeVisible();
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

    const navBtn = mount.locator('.ai-designer-header__nav-btn');
    const designerTab = navBtn.filter({ hasText: /^Designer$/i });
    await expect(designerTab).toBeVisible();

    await designerTab.click();

    await expect(mount.getByText(/^Chat$/)).toBeVisible();
    await expect(mount.getByText(/^Preview$/)).toBeVisible();

    const bottomPrompt = mount.getByPlaceholder(/describe your design idea/i);
    await expect(bottomPrompt).toBeVisible();
    await expect(bottomPrompt).toBeEnabled();

    await expect(mount.locator('.chat-send-button')).toBeVisible();

    await expect(mount.getByText(/^Try:$/)).toBeVisible();
    const trySuggestion = mount.locator('.chat-input-suggestion__pill');
    await expect(trySuggestion).toBeVisible();
    await expect(trySuggestion).toBeEnabled();
  });

  test('tab switching between Dashboard and Designer', async ({ page }) => {
    const mount = page.locator('#nfd-ai-page-designer-mount');
    const navBtn = mount.locator('.ai-designer-header__nav-btn');
    const dashboardTab = navBtn.filter({ hasText: /^Dashboard$/i });
    const designerTab = navBtn.filter({ hasText: /^Designer$/i });

    await expect(mount.locator('.ai-hero__heading')).toBeVisible();

    await designerTab.click();
    await expect(
      mount.getByText(/live preview will appear here/i)
    ).toBeVisible();
    await expect(mount.locator('.ai-hero__heading')).not.toBeVisible();

    await dashboardTab.click();
    await expect(dashboardTab).toHaveClass(/active/);
    await expect(mount.locator('.ai-hero__heading')).toBeVisible();
    await expect(mount.getByPlaceholder(/search pages/i)).toBeVisible();
  });
});
