import { test, expect } from '@playwright/test';
import { auth, a11y, newfold } from '../helpers';

test.describe('AI Page Designer', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);

    const capabilities = {
      canAccessAI: true,
      canAccessAIPageDesigner: true,
      hasAISiteGen: true,
    };
    const mount = page.locator('#nfd-ai-page-designer-mount');

    // On CI the very first admin request of a fresh install renders with an
    // empty NewfoldRuntime.capabilities. Re-apply the capabilities and load the page
    // again rather than let whichever spec happens to run first absorb the failure.
    for (let attempt = 0; attempt < 3; attempt++) {
      await newfold.setCapability(capabilities);
      await auth.navigateToAdminPage(page, 'admin.php?page=web#/ai-designer');
      await page.waitForSelector('#wppw-app-rendered', { timeout: 15000 });

      // Wait properly rather than checking instantaneously: the AI Designer
      // page is a React.lazy() import, so the mount appears a beat after
      // #wppw-app-rendered. A bare count() here retries on that race and
      // makes the diagnostic below fire before the page had a fair chance.
      try {
        await mount.waitFor({ state: 'attached', timeout: 15000 });
        break;
      } catch (e) {
        // Genuinely absent after waiting -- fall through and record why.
      }

      // TEMPORARY DIAGNOSTIC -- remove once the first-run capability failure
      // is understood. Three readings taken at the moment of failure:
      //   db     - what the options table actually holds
      //   page   - what this rendered document received
      //   refetch- a fresh server request on this same context/session,
      //            which distinguishes a stale browser cache from the server
      //            genuinely returning no capabilities for this session.
      const dbCaps = await newfold.logCapabilities();
      const pageCaps = await page.evaluate(
        () => window.NewfoldRuntime && window.NewfoldRuntime.capabilities
      );
      let refetchCaps = 'n/a';
      try {
        const res = await page.request.get(page.url().split('#')[0]);
        const html = await res.text();
        const m = html.match(/capabilities":(\[\]|\{[^}]*\})/);
        refetchCaps = m ? m[1] : 'not-found-in-html';
      } catch (e) {
        refetchCaps = `error: ${e.message}`;
      }

      console.log(`[aipd-diag] attempt=${attempt} url=${page.url()}`);
      console.log(`[aipd-diag]   db      = ${JSON.stringify(dbCaps)}`);
      console.log(`[aipd-diag]   page    = ${JSON.stringify(pageCaps)}`);
      console.log(`[aipd-diag]   refetch = ${refetchCaps}`);
    }

    await expect(mount).toBeVisible({ timeout: 15000 });
    await expect
      .poll(() => mount.evaluate((el) => el.childElementCount), {
        timeout: 20000,
      })
      .toBeGreaterThan(0);
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
    const trySuggestion = mount
      .locator('.chat-input-suggestion__pill')
      .first();
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
