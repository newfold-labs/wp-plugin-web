import { test, expect } from '@playwright/test';
import { auth } from '../helpers';

/**
 * @param {import('@playwright/test').Page} page
 */
function nextStepsScope(page) {
  return page.locator('#nfd-nextsteps');
}

/**
 * @param {import('@playwright/test').Locator} scope
 * @param {string | RegExp} title
 */
async function expandMainSection(scope, title) {
  const header = scope.locator('.nfd-track-header').filter({ hasText: title });
  await header.scrollIntoViewIfNeeded();
  await header.click();
}

/**
 * @param {import('@playwright/test').Locator} scope
 * @param {RegExp} labelPattern
 */
function sectionTitle(scope, labelPattern) {
  return scope.locator('.nfd-section-title').filter({ hasText: labelPattern });
}

/**
 * @param {import('@playwright/test').Locator} scope
 * @param {string} eventKey
 * @param {RegExp} [hrefPattern]
 */
async function expectTaskLinkByKey(scope, eventKey, hrefPattern) {
  const link = scope.locator(`a[data-nfd-event-key="${eventKey}"]`).first();

  await expect(link).toBeAttached({ timeout: 15000 });

  if (hrefPattern) {
    await expect(link).toHaveAttribute('href', hrefPattern);
  }
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} adminPath
 * @param {{ shouldCheckDashboardWidget?: boolean }} options
 */
async function openNextStepsPage(page, adminPath, options = {}) {
  const { shouldCheckDashboardWidget = false } = options;

  await auth.navigateToAdminPage(page, adminPath);

  if (shouldCheckDashboardWidget) {
    await expect(page.locator('#nfd_next_steps_widget')).toBeVisible({
      timeout: 15000,
    });
  } else {
    await page.waitForSelector('#wppw-app-rendered', { timeout: 15000 });
  }

  const panel = nextStepsScope(page);

  await expect(panel).toBeVisible({ timeout: 15000 });
  await expect(
    panel.locator('.nfd-track-title').filter({ hasText: /^Build$/ })
  ).toBeVisible({ timeout: 15000 });

  return panel;
}

/**
 * @param {import('@playwright/test').Locator} ns
 */
async function expectBuildBrandGrowTaskLinks(ns) {
  await expandMainSection(ns, /^Build$/);
  await expect(sectionTitle(ns, /Basic blog setup/)).toBeAttached();
  await expectTaskLinkByKey(ns, 'blog_quick_setup', /options-general/);

  await expandMainSection(ns, /^Brand$/);
  await expect(
    sectionTitle(ns, /First Audience-Building Steps/)
  ).toBeAttached();
  await expect(
    ns
      .locator('a.nfd-nextsteps-link')
      .filter({ hasText: /Optimize On-Page SEO/ })
      .first()
  ).toBeAttached();

  await expandMainSection(ns, /^Grow$/);
  await expect(sectionTitle(ns, /Blog analytics/)).toBeAttached();
}

test.describe('Next Steps', () => {
  test('portal renders on Netsol dashboard with Build, Brand, and Grow with task links', async ({
    page,
  }) => {
    const ns = await openNextStepsPage(page, 'admin.php?page=web#/home');

    await expectBuildBrandGrowTaskLinks(ns);
  });

  test('portal renders on the WP admin Dashboard with Build, Brand, and Grow with task links', async ({
    page,
  }) => {
    const ns = await openNextStepsPage(page, 'index.php', {
      shouldCheckDashboardWidget: true,
    });

    await expectBuildBrandGrowTaskLinks(ns);
  });
});