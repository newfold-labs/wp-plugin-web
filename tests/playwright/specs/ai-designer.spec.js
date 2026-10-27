import { test, expect } from '@playwright/test';
import { auth, a11y, newfold } from '../helpers';

const MOUNT = '#nfd-ai-page-designer-mount';
const SHELL = '.ai-workspace-shell';

// The module's own REST namespace (includes/AIPageDesigner.php -> apiUrl).
// Matched as a substring so the fixtures work under both pretty permalinks
// (/wp-json/...) and plain ones (/?rest_route=/...).
const API = 'newfold-ai-page-designer/v1';

const FIXTURE_TITLE = 'Playwright Fixture Page';
const FIXTURE_EXCERPT = 'A fixture excerpt for the meta strip.';

const FIXTURE_PAGE = {
  id: 424242,
  title: { rendered: FIXTURE_TITLE },
  // Already block markup, so handleSelectItem() uses it verbatim instead of
  // running it through convertHtmlToGutenberg().
  content: {
    raw: '<!-- wp:paragraph --><p>Fixture body copy.</p><!-- /wp:paragraph -->',
    rendered: '<p>Fixture body copy.</p>',
  },
  excerpt: { raw: FIXTURE_EXCERPT, rendered: `<p>${ FIXTURE_EXCERPT }</p>` },
  featured_media: 0,
  supports_thumbnail: true,
  status: 'publish',
  link: 'http://localhost/?page_id=424242',
  type: 'page',
  modified: new Date().toISOString(),
};

const sidePanelTab = (mount, name) =>
  mount
    .locator('.ai-side-panel__tab')
    .filter({ hasText: new RegExp(`^${name}$`) });

// Chat / Design / History all stay mounted and are swapped with a CSS
// transform, so aria-hidden -- not visibility -- is what actually tells the
// panels apart.
const sidePanel = (mount, index) =>
  mount.locator('.ai-side-panel__panel').nth(index);

const fulfillJson = (page, fragment, body) =>
  page.route(
    (url) => url.href.includes(fragment),
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })
  );

// useSiteContent/useRecentItems both fetch on mount, so the fixtures have to be
// in place before the bundle boots -- hence the reload.
const loadWithContentFixtures = async (page) => {
  await fulfillJson(page, `${ API }/recent`, [FIXTURE_PAGE]);
  await fulfillJson(page, `${ API }/content/pages`, [FIXTURE_PAGE]);
  await fulfillJson(page, `${ API }/content/posts`, []);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#wppw-app-rendered', { timeout: 15000 });
  await page.locator(`${ MOUNT } ${ SHELL }`).waitFor({
    state: 'visible',
    timeout: 15000,
  });
};

// Opens the page a fixture page is already selected on: the canvas shows the
// preview frame and the meta strip instead of the empty-state hero.
const selectFixturePage = async (page) => {
  const mount = page.locator(MOUNT);

  await mount.locator('.ai-workspace-header__drawer-toggle').click();
  await mount
    .locator('.ai-page-drawer__item')
    .filter({ hasText: FIXTURE_TITLE })
    .click();

  await expect(mount.locator('.ai-meta-strip')).toBeVisible();
};

test.describe('AI Page Designer', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);

    const capabilities = {
      canAccessAI: true,
      canAccessAIPageDesigner: true,
      hasAISiteGen: true,
    };
    const mount = page.locator(MOUNT);
    const workspace = mount.locator(SHELL);

    // On CI the very first admin request of a fresh install renders with an
    // empty NewfoldRuntime.capabilities. Re-apply the capabilities and load the page
    // again rather than let whichever spec happens to run first absorb the failure.
    for (let attempt = 0; attempt < 3; attempt++) {
      await newfold.setCapability(capabilities);

      if (attempt === 0) {
        await auth.navigateToAdminPage(page, 'admin.php?page=web#/ai-designer');
      } else {
        // Must be reload(), as it re-requests the document,
        // so a capability written since the initial load is actually picked up.
        await page.reload({ waitUntil: 'domcontentloaded' });
      }

      await page.waitForSelector('#wppw-app-rendered', { timeout: 15000 });

      // Wait rather than checking instantaneously: the AI Designer page is
      // a React.lazy() import, and the module bundle mounts the workspace shell
      // a beat after the route chunk loads.
      try {
        await workspace.waitFor({ state: 'visible', timeout: 15000 });
        break;
      } catch (e) {
        // Genuinely absent after waiting -- fall through and retry.
      }
    }

    await expect(workspace).toBeVisible({ timeout: 15000 });
  });

  test('workspace is accessible', async ({ page }) => {
    const mount = page.locator(MOUNT);

    // Default: empty canvas + open sidebar (Chat).
    await a11y.checkA11y(page, MOUNT);

    await mount.locator('.ai-workspace-header__drawer-toggle').click();
    await expect(mount.locator('.ai-page-drawer')).toBeVisible();
    await a11y.checkA11y(page, MOUNT);

    await mount.locator('.ai-workspace-header__drawer-toggle').click();
    await expect(mount.locator('.ai-page-drawer')).not.toBeVisible();

    await sidePanelTab(mount, 'Design').click();
    await expect(sidePanel(mount, 1)).toHaveAttribute('aria-hidden', 'false');
    await a11y.checkA11y(page, MOUNT);
  });

  test('route and shell render', async ({ page }) => {
    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toBe('#/ai-designer');

    await expect(page.locator('#wppw-app-rendered')).toBeVisible();
    await expect(page.locator('.wppw-ai-designer-wrapper')).toBeVisible();
    await expect(page.locator(MOUNT)).toBeVisible();

    const mount = page.locator(MOUNT);
    await expect(mount.locator('#nfd-ai-page-designer-root')).toBeVisible();
    await expect(mount.locator(SHELL)).toBeVisible();
    await expect(mount.getByRole('button', { name: 'New Page' })).toBeVisible();
    await expect(mount.locator('.ai-workspace-header__title')).toHaveText(
      'Untitled'
    );
  });

  test('empty state canvas shows intelligence hero and prompt chips', async ({
    page,
  }) => {
    const mount = page.locator(MOUNT);

    await expect(mount.locator('.ai-hero__chip')).toHaveText(
      'Intelligence Canvas'
    );
    await expect(mount.locator('.ai-hero__heading')).toHaveText(
      'Create New Page with AI'
    );
    await expect(
      mount.getByText(/leverage ai to generate/i)
    ).toBeVisible();

    const heroInput = mount.locator('.ai-hero__input');
    await expect(heroInput).toBeVisible();
    await expect(heroInput).toBeEnabled();
    await expect(heroInput).toHaveAttribute(
      'placeholder',
      /describe your dream page/i
    );

    await expect(mount.locator('.ai-hero__generate-btn')).toBeVisible();

    // Scoped to the hero: the chat panel renders its own "Try:" label at the
    // same time, so an unscoped getByText() is a strict-mode violation.
    await expect(mount.locator('.ai-hero__prompt-label')).toHaveText('Try:');
    const heroChip = mount.locator('.ai-hero__prompt-chip').first();
    await expect(heroChip).toBeVisible();
    await expect(heroChip).toBeEnabled();
  });

  test('sidebar chat panel shows prompt controls', async ({ page }) => {
    const mount = page.locator(MOUNT);

    const chatTab = sidePanelTab(mount, 'Chat');
    const designTab = sidePanelTab(mount, 'Design');
    const historyTab = sidePanelTab(mount, 'History');

    await expect(chatTab).toBeVisible();
    await expect(chatTab).toHaveClass(/active/);
    await expect(designTab).toBeVisible();
    await expect(historyTab).toBeVisible();

    await expect(
      mount.getByText(/describe the page you.d like to create/i)
    ).toBeVisible();

    const chatPrompt = mount.getByPlaceholder(/describe your design idea/i);
    await expect(chatPrompt).toBeVisible();
    await expect(chatPrompt).toBeEnabled();

    await expect(mount.locator('.chat-send-button')).toBeVisible();

    // Hero-scoped counterpart of this label lives in the empty-state canvas.
    await expect(mount.locator('.chat-input-suggestion__label')).toHaveText(
      'Try:'
    );
    const trySuggestion = mount
      .locator('.chat-input-suggestion__pill')
      .first();
    await expect(trySuggestion).toBeVisible();
    await expect(trySuggestion).toBeEnabled();
  });

  test('page drawer and sidebar tabs switch workspace panels', async ({
    page,
  }) => {
    const mount = page.locator(MOUNT);

    await expect(mount.locator('.ai-hero__heading')).toBeVisible();

    await mount.locator('.ai-workspace-header__drawer-toggle').click();
    await expect(mount.locator('.ai-page-drawer')).toBeVisible();
    await expect(
      mount.getByPlaceholder(/search pages and posts/i)
    ).toBeVisible();

    await mount.locator('.ai-workspace-header__drawer-toggle').click();
    await expect(mount.locator('.ai-page-drawer')).not.toBeVisible();

    // Chat is the default panel.
    await expect(sidePanel(mount, 0)).toHaveAttribute('aria-hidden', 'false');
    await expect(sidePanel(mount, 1)).toHaveAttribute('aria-hidden', 'true');
    await expect(sidePanel(mount, 2)).toHaveAttribute('aria-hidden', 'true');

    const designTab = sidePanelTab(mount, 'Design');
    await designTab.click();
    await expect(designTab).toHaveClass(/active/);
    await expect(sidePanel(mount, 0)).toHaveAttribute('aria-hidden', 'true');
    await expect(sidePanel(mount, 1)).toHaveAttribute('aria-hidden', 'false');
    await expect(
      sidePanel(mount, 1).getByRole('heading', { name: 'Color palette' })
    ).toBeVisible();

    // The canvas is independent of the sidebar: the hero stays put.
    await expect(mount.locator('.ai-hero__heading')).toBeVisible();

    const chatTab = sidePanelTab(mount, 'Chat');
    await chatTab.click();
    await expect(chatTab).toHaveClass(/active/);
    await expect(sidePanel(mount, 0)).toHaveAttribute('aria-hidden', 'false');
    await expect(sidePanel(mount, 1)).toHaveAttribute('aria-hidden', 'true');
  });

  test('viewport toggle moves the pressed device', async ({ page }) => {
    const mount = page.locator(MOUNT);
    const device = (name) => mount.getByRole('button', { name });

    await expect(device('Desktop preview')).toHaveClass(/is-pressed/);
    await expect(device('Tablet preview')).not.toHaveClass(/is-pressed/);
    await expect(device('Mobile preview')).not.toHaveClass(/is-pressed/);

    await device('Tablet preview').click();
    await expect(device('Tablet preview')).toHaveClass(/is-pressed/);
    await expect(device('Desktop preview')).not.toHaveClass(/is-pressed/);

    await device('Mobile preview').click();
    await expect(device('Mobile preview')).toHaveClass(/is-pressed/);
    await expect(device('Tablet preview')).not.toHaveClass(/is-pressed/);

    await device('Desktop preview').click();
    await expect(device('Desktop preview')).toHaveClass(/is-pressed/);
  });

  test('History tab starts empty', async ({ page }) => {
    const mount = page.locator(MOUNT);

    await sidePanelTab(mount, 'History').click();

    const pane = mount.locator('.ai-history-pane');
    await expect(
      pane.getByRole('heading', { name: 'Edit History' })
    ).toBeVisible();
    await expect(pane.locator('.ai-history-pane__empty')).toContainText(
      'No edits yet.'
    );
    await expect(pane.locator('.ai-history-pane__count')).toHaveCount(0);
  });

  test('Publish is gated until something changes, then opens the modal', async ({
    page,
  }) => {
    const mount = page.locator(MOUNT);
    const publish = mount.locator('.ai-workspace-header__publish');

    // Nothing generated, no page open, no design change yet.
    await expect(publish).toBeDisabled();

    // Picking a palette makes the design tokens dirty, which is enough to
    // enable Publish without an AI round-trip.
    await sidePanelTab(mount, 'Design').click();
    await mount.locator('.ai-design-tab__palette').nth(1).click();
    await expect(publish).toBeEnabled();

    await publish.click();

    // With no page selected, Publish opens the destination modal rather than
    // replacing an existing item.
    const modal = mount.locator('.publish-modal');
    await expect(modal).toBeVisible();
    await expect(
      modal.getByRole('heading', { name: 'Publish Options' })
    ).toBeVisible();

    const options = modal.locator('.publish-option');
    await expect(options).toHaveCount(3);
    await expect(options.nth(0)).toContainText('Blog Post');
    await expect(options.nth(1)).toContainText('New Page');
    await expect(options.nth(1)).toContainText('Publish as a standalone page');
    await expect(options.nth(2)).toContainText('Set as Homepage');

    await expect(modal.locator('.publish-modal-section-title').nth(0)).toHaveText(
      'PAGES'
    );
    await expect(modal.locator('.publish-modal-section-title').nth(1)).toHaveText(
      'POSTS'
    );

    await modal.locator('.publish-modal-close').click();
    await expect(modal).toHaveCount(0);
  });

  test('Cmd+K opens the command palette and searches the site', async ({
    page,
  }) => {
    const mount = page.locator(MOUNT);

    await fulfillJson(page, '/wp/v2/search', [
      {
        id: 99,
        title: 'Searchable Fixture',
        url: 'http://localhost/?p=99',
        type: 'post',
        subtype: 'page',
      },
    ]);

    await expect(mount.locator('.ai-command-palette')).toHaveCount(0);

    // Ctrl is accepted on every platform (the handler checks metaKey||ctrlKey).
    await page.keyboard.press('Control+k');

    const palette = mount.locator('.ai-command-palette');
    await expect(palette).toBeVisible();

    // Distinct from the page drawer's "Search pages and posts" label.
    const search = palette.getByLabel('Search all pages and posts');
    await expect(search).toBeFocused();
    await expect(palette.locator('.ai-command-palette__status')).toHaveText(
      'Type to search every page and post on this site.'
    );
    await expect(palette.locator('.ai-command-palette__hint')).toHaveText('Esc');

    await search.fill('Searchable');
    await expect(palette.locator('.ai-command-palette__item-title')).toHaveText(
      'Searchable Fixture'
    );
    await expect(palette.locator('.ai-command-palette__item-type')).toHaveText(
      'page'
    );

    await search.press('Escape');
    await expect(palette).toHaveCount(0);
  });

  test.describe('with a page open', () => {
    test.beforeEach(async ({ page }) => {
      await loadWithContentFixtures(page);
    });

    test('meta strip appears with the selected page title and excerpt', async ({
      page,
    }) => {
      const mount = page.locator(MOUNT);

      // Hidden while the canvas is empty (no selection, nothing generated).
      await expect(mount.locator('.ai-meta-strip')).toHaveCount(0);

      await selectFixturePage(page);

      const strip = mount.locator('.ai-meta-strip');
      await expect(strip.locator('.ai-meta-strip__input')).toHaveValue(
        FIXTURE_TITLE
      );
      await expect(strip.locator('.ai-meta-strip__textarea')).toHaveValue(
        FIXTURE_EXCERPT
      );
      await expect(strip.getByText('Page Title')).toBeVisible();
      await expect(strip.getByText('Excerpt')).toBeVisible();
      await expect(
        strip.getByRole('button', { name: /Change Hero/ })
      ).toBeVisible();

      // The header title tracks the meta title, and the drawer closes itself.
      await expect(mount.locator('.ai-workspace-header__title')).toHaveText(
        FIXTURE_TITLE
      );
      await expect(mount.locator('.ai-page-drawer')).toHaveCount(0);

      // Canvas swapped the empty-state hero for the preview frame.
      await expect(mount.locator('.ai-hero__heading')).toHaveCount(0);
      await expect(mount.locator('.ai-preview-panel')).toBeVisible();
    });

    test('editing the meta title enables Publish', async ({ page }) => {
      const mount = page.locator(MOUNT);

      await selectFixturePage(page);

      const publish = mount.locator('.ai-workspace-header__publish');
      await expect(publish).toBeDisabled();

      await mount.locator('.ai-meta-strip__input').fill('Renamed by Playwright');
      await expect(publish).toBeEnabled();
      await expect(mount.locator('.ai-workspace-header__title')).toHaveText(
        'Renamed by Playwright'
      );
    });

    test('viewport toggle drives the preview frame', async ({ page }) => {
      const mount = page.locator(MOUNT);

      await selectFixturePage(page);

      const preview = mount.locator('.ai-preview-panel');
      await expect(preview).toHaveAttribute('data-viewport', 'desktop');

      await mount.getByRole('button', { name: 'Tablet preview' }).click();
      await expect(preview).toHaveAttribute('data-viewport', 'tablet');

      await mount.getByRole('button', { name: 'Mobile preview' }).click();
      await expect(preview).toHaveAttribute('data-viewport', 'mobile');
    });

    test('History tab records a design change', async ({ page }) => {
      const mount = page.locator(MOUNT);

      // addHistoryEntry() no-ops without preview markup, so a page has to be
      // open before a palette change is recorded.
      await selectFixturePage(page);

      await sidePanelTab(mount, 'Design').click();
      const palette = mount.locator('.ai-design-tab__palette').nth(1);
      const paletteName = await palette
        .locator('.ai-design-tab__palette-name')
        .innerText();
      await palette.click();

      await sidePanelTab(mount, 'History').click();

      const pane = mount.locator('.ai-history-pane');
      await expect(pane.locator('.ai-history-pane__count')).toHaveText(
        '1 edits'
      );
      await expect(
        pane.locator('.ai-history-pane__item-label').first()
      ).toHaveText(`Palette → ${ paletteName }`);
      await expect(
        pane.locator('.ai-history-pane__current-badge')
      ).toHaveText('Current');
    });
  });
});
