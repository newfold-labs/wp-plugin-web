# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A WordPress plugin ("Network Solutions Plugin" / `wp-plugin-web`) that integrates a WordPress site with the Network Solutions / Web.com control panel: coming-soon page, performance, security, updates, marketplace, AI page designer, and a React-based admin SPA. It is built on Newfold Digital's module system (`newfold-labs/wp-module-*` packages pulled in via Composer) — most functional features (coming soon, performance, marketplace, onboarding, AI, ecommerce, etc.) live in those vendored modules, not in this repo. This repo is the "wrapper" plugin: it wires modules together, defines the admin app shell, and adds Network-Solutions/Web.com-specific behavior.

PHP floor is **7.4** (see `Requires PHP` header in `wp-plugin-web.php`, `composer.json` platform, and `phpcs.xml` `testVersion`). Do not introduce PHP 8-only syntax (union types, named arguments, `match`, attributes, constructor property promotion) in first-party code.

## Commands

### PHP

- `composer run lint` — PHPCS against `phpcs.xml` (Newfold ruleset + WordPress-Core, short arrays required, testVersion 7.4-).
- `composer run fix` — PHPCBF auto-fix.
- `composer run i18n` — regenerate `.pot`/`.po`/`.mo`/`.json` language files (runs `i18n-pot`, `i18n-po`, `i18n-mo`, `i18n-json` in sequence).
- `vendor/bin/phpunit` — run PHP unit tests (config in `phpunit.xml`, bootstrap at `tests/phpunit/bootstrap.php`, uses `wp-phpunit/wp-phpunit`). Run a single test with `vendor/bin/phpunit --filter TestName tests/phpunit/SomeTest.php`.
- `npm run php-deps` — `composer install --no-dev --optimize-autoloader` (used for release builds).

### JS / build

- `npm run start` — dev build via `wp-scripts start` (`NODE_ENV=develop`).
- `npm run build` — production build via `wp-scripts build`, output goes to a **version-stamped** directory `build/<version>` (see `webpack.config.js`); the version comes from `package.json`.
- `npm run lint:js` / `npm run lint:js:fix` — ESLint over `./src`.
- `npm run lint:css` — Stylelint over `**/*.css`.
- `npm run lint:pkg-json` — `wp-scripts lint-pkg-json`.
- `npm run test:unit` — `wp-scripts test-unit-js`.

### E2E / visual tests

- `npm run test:playwright` (alias `npm run test:e2e`) — Playwright suite (`tests/playwright/specs`); config in `playwright.config.mjs`. `npm run test:playwright:update-projects` regenerates `tests/playwright/playwright-projects.json`.
- Cypress specs also exist under `tests/cypress/integration` (config `cypress.config.js`), run via the Cypress CLI/GUI directly.
- `npm run log:watch` — tails the `wp-env` WordPress debug log (`wp-env run wordpress 'tail -f ...debug.log'`), useful while driving Playwright/Cypress locally.
- Local WP environment is `@wordpress/env`, configured in `.wp-env.json` (core `7.0` tag, PHP 8.1, ports 8886/8887).

### Version bumps / releases

The plugin version exists in **three places** that must stay in sync: the plugin header and `WEB_PLUGIN_VERSION` constant in `wp-plugin-web.php`, and `version` in `package.json` (this drives the `build/<version>` cache-busting directory). Use `npm run set-version-bump:{patch,minor,major}` rather than editing them by hand — it also reinstalls, rebuilds, and regenerates i18n. `npm run simulate-runner-build` (alias `npm run srb`) reproduces the CI release build locally: clean → install → `php-deps` → `build` → `create:dist` (rsync per `.distignore`) → `create:zip`.

## Architecture

### PHP load order (`wp-plugin-web.php` → `bootstrap.php`)

1. `wp-plugin-web.php` is the plugin header file. On `plugins.php` it runs a standalone PHP-version compat check (`inc/plugin-php-compat-check.php`) before anything else loads, so that an incompatible-PHP site still shows a friendly admin notice rather than a fatal. It then runs `inc/plugin-nfd-compat-check.php` to self-deactivate against known-incompatible/legacy Newfold-family plugins (Bluehost, MOJO, HostGator, Crazy Domains). Only if PHP version checks pass does it `require bootstrap.php`.
2. `bootstrap.php` requires the Composer autoloader (falls back to `wp_die` on local environments if `vendor/` is missing — Composer deps aren't committed), then constructs a Newfold `Container`/`Plugin` and calls `setContainer()` — this is how the vendored Newfold modules (coming-soon, features, etc.) discover this plugin's config (`id: 'web'`, brand from `mm_brand` option).
3. It configures the "coming soon" module's copy/branding via the `newfold/coming-soon/filter/args` filter, loads `inc/Data.php` (AI SiteGen brand mapping) and `inc/ai-page-designer-config.php`, and remaps the AI SiteGen brand filter for sub-brands (web/vodien/crazy-domains all report as `networksolutions`).
4. Runs `WP_Forge\UpgradeHandler\UpgradeHandler` against `inc/upgrades/*.php` (files named by version, e.g. `2.1.8.php`) comparing the stored `web_plugin_version` option to `WEB_PLUGIN_VERSION`, only in admin.
5. Requires the remaining first-party files (`inc/Admin.php`, `inc/AdminBar.php`, `inc/base.php`, `inc/jetpack.php`, `inc/partners.php`, REST controllers, `inc/settings.php`, `inc/updates.php`, `inc/widgets/bootstrap.php`), then instantiates `Admin` (admin-only) and `AdminBar`, and boots the Newfold `Features` singleton.
6. Contains a handful of standalone, non-obvious hooks worth knowing about if touching REST/onboarding/activation flows:
   - A PayPal Partner-Attribution-Id filter pair (`http_request_args` + `script_loader_tag`) that stamps `Yith_PCP` onto outgoing PayPal API calls and the PayPal SDK script tag.
   - A `wp_after_insert_post` hook that force-flushes rewrite rules whenever a page is published via a REST request — this works around `wp-module-onboarding`'s `PreviewsService::publish_page()` creating preview pages without flushing rewrites, which 404s on production with pretty permalinks. It fires because `wp_after_insert_post` is a direct function call inside `wp_insert_post()`, not an action removed by that service's cleanup.
   - Fresh-activation handling: `register_activation_hook` sets a `nfd_activated_fresh` option; `admin_init` checks it and runs `on_activate()` (clears stale Newfold transients, flushes rewrites) exactly once.

### PHP module layout (`inc/`)

- `Admin.php` — registers the top-level `web` admin menu page and its subpages (Home/Marketplace/Settings/AI Designer[conditional]/Help — all client-side routes under one PHP page via `#/route` hashes), enqueues the built JS/CSS bundle only when the current screen matches, and renders the `#wppw-app` mount div React attaches to.
- `AdminBar.php` — adds items to the WP admin bar.
- `RestApi/` — first-party REST routes under the `web/v1` namespace, registered from `RestApi/rest-api.php` on `rest_api_init`. `SettingsController` is the read/write bridge between the React settings UI and a large grab-bag of WP core + Newfold options (auto-updates, comments, cache level, homepage settings, etc.) — when adding a new settings field, follow the pattern of a case in both `get_current_settings()` and `update_item()`'s switch. `CachingController` handles cache purge.
- `widgets/` — WP dashboard widgets (`SitePreview.php` + `widgets/views` templates), bootstrapped from `widgets/bootstrap.php`.
- `upgrades/` — one file per version (e.g. `2.1.8.php`), procedural, run by `UpgradeHandler` when the stored version is older; add a new file named for the target version rather than editing an existing one.
- `AutoIncrement.php` is the reference implementation for PHP style/typing in this codebase (see below) — model new/modernized PHP after it, not after older untyped files.
- `plugin-php-compat-check.php` / `plugin-nfd-compat-check.php` run before the rest of the plugin and must stay defensive/typed carefully since they execute on every `plugins.php` load, including on incompatible environments.

### PHP style / typing standard (from `docs/php-7-modernization-plan.md`)

For first-party code (`wp-plugin-web.php`, `bootstrap.php`, `inc/**` except vendored modules, `tests/phpunit/`) — **not** `vendor/`:

- PHP 7.4+ syntax only.
- Short array syntax `[]`, `??`/`??=`, and `fn()` arrow functions where they read more clearly.
- Native param/return types (and typed properties) matching `AutoIncrement.php`'s style.
- Do **not** add native types to methods/properties overriding untyped WordPress core parents (e.g. `WP_REST_Controller::register_routes()`, `$namespace`) — this fatals. `SettingsController`/`CachingController` deliberately leave these untyped.
- `vendor/` and packaged copies under `wp-plugin-web/` are out of scope and excluded from PHPCS.

### Frontend (`src/`)

- `src/app` is the React admin SPA (mounted into `#wppw-app` by `Admin::render()`). `src/app/data/routes.js` defines the route table (`Home`, `Marketplace`, `Settings`/`Settings/performance`, `AI Designer`, `Help`, `Admin`) each with a `condition` gating visibility — some conditions read `window.NewfoldFeatures`/`window.NewfoldRuntime` (runtime data injected PHP-side via the `newfold_runtime` filter in `Admin::add_to_runtime()`, backed by `Web\Data`).
- `src/portalRegistry` is a separate webpack entry (`portal-registry.js`) shared/loaded independently of the main app bundle — used for portal-based mounting into containers rendered conditionally by `Admin::render()` (`nfd-<feature>-portal` divs, gated by `Features::isEnabled()`).
- Webpack (`webpack.config.js`) extends `@wordpress/scripts`' default config: build output is versioned (`build/<package.json version>`), and defines import aliases (`App`, `Assets`, `Store` → `data/store.js`, `Routes` → `data/routes.js`, `@modules` → `vendor/newfold-labs/`) plus globally-provided common imports (`useState`, `useEffect`, `__`, `sprintf`, `classNames`, several lodash helpers, etc.) via webpack `ProvidePlugin` — these don't need explicit imports in `src/` files.
- Many UI pieces (e.g. marketplace subnav) are pulled from vendored Newfold modules under `vendor/newfold-labs/` via the `@modules` alias rather than living in `src/` — check there before assuming a component doesn't exist.

### Newfold module system

Almost all substantive product features (performance, ecommerce, marketplace, onboarding, notifications, AI SiteGen/page designer, SSO, secure passwords, etc.) are separate `newfold-labs/wp-module-*` Composer packages pulled from a private Satis repo, installed with `preferred-install: source` so they're browsable under `vendor/newfold-labs/`. When a bug or behavior seems to originate in one of these areas, look in `vendor/newfold-labs/wp-module-*` first — this repo's own code is mostly glue (menu registration, settings passthrough, branding/copy overrides, compat checks) rather than the feature implementation itself.
