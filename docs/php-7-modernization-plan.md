# PHP 7.x Modernization Plan

Modernize first-party PHP to consistently use PHP 7.x features (through 7.4), aligned with the plugin’s declared floor.

## Scope

**In scope**

- `wp-plugin-web.php`
- `bootstrap.php`
- `inc/` (except the exclusion below)
- `tests/phpunit/`

**Out of scope**

- `vendor/` and all Composer modules (including `wp-module-ai-page-designer` and other Newfold modules)
- Build artifacts (`build/`, packaged copies under nested `wp-plugin-web/`)
- PHP 8-only syntax (union types, named arguments, `match`, attributes, constructor property promotion, etc.)

## Current baseline

| Signal | Value | Notes |
|--------|--------|--------|
| Plugin header | `Requires PHP: 7.4` | Declared floor |
| `composer.json` platform | `7.3.0` | Below declared floor — fix in Phase 1 |
| PHPCS `testVersion` | `7.0-` | Too permissive — fix in Phase 1 |
| CI PHP (`lint-php.yml`) | `7.4` | Already aligned |
| PHPStan | Not configured | Optional guardrail in Phase 7 |

**Reference implementation:** `inc/AutoIncrement.php` already uses scalar/nullable/void types, return types, and structured PHPDoc. New and modernized code should follow that pattern.

**Known first-party gaps (at plan time)**

- Widespread `array()` instead of short array syntax `[]`
- Return/param types largely missing outside `AutoIncrement.php`
- Untyped properties on compat-check classes (PHP 7.4 typed properties opportunity)
- A few `isset( $x ) ? $x : $default` patterns that can become `??`
- Little/no use of `??=`, arrow functions (`fn()`), or `void`/`?Type` outside AutoIncrement

---

## Phase 1 — Align PHP 7.4 floor

**Status:** Done

**Goal:** Make tooling and packaging agree that PHP 7.4+ is the minimum.

**Tasks**

1. Update `composer.json` platform to `"php": "7.4.0"`.
2. Update `phpcs.xml` `testVersion` from `7.0-` to `7.4-`.
3. Confirm plugin header remains `Requires PHP: 7.4`.
4. Confirm CI stays on PHP 7.4 (no change required unless matrix work is added later).
5. Run `composer lint` / PHPCS and record baseline.
6. Exclude `inc/onboarding-access-control.php` from PHPCS (out of scope).
7. Refresh `composer.lock` content-hash after platform change.

**Success criteria**

- Platform, PHPCS, and plugin header all declare 7.4+.
- Lint runs cleanly (or only known pre-existing issues are documented).

**Baseline after Phase 1 (in-scope):** 7 errors, 8 warnings (pre-existing; onboarding file excluded).

**Risk:** Low (config-only).

---

## Phase 2 — Mechanical syntax modernization

**Status:** Done

**Goal:** Apply safe, behavior-preserving PHP 7.x / style updates across in-scope files.

**Tasks**

1. Convert `array()` → `[]` in in-scope first-party PHP.
2. Replace `isset( $a['k'] ) ? $a['k'] : $default` with `??` where equivalent.
3. Use `??=` for default assignments where it clarifies intent (PHP 7.4).
4. Optionally convert single-expression closures to arrow functions (`fn()`) where readability improves (e.g. simple filters in `bootstrap.php`).
5. Prefer trailing commas in multiline arrays/argument lists (PHP 7.2/7.3).
6. Update `phpcs.xml` to allow/enforce short arrays (`exclude Universal.Arrays.DisallowShortArraySyntax`, add `Generic.Arrays.DisallowLongArraySyntax`).

**Completed**

- 86 `array()` → `[]` conversions across 16 files
- 4 `isset() ? :` → `??` replacements (`AutoIncrement`, both compat-check helpers, `bootstrap.php` PayPal BN code)
- One `fn()` arrow function for the plugin container factory in `bootstrap.php`
- No clean `??=` candidates found (left as-is)
- `inc/onboarding-access-control.php` untouched and excluded from PHPCS

**Do not**

- Change control flow or WordPress hook behavior.
- Touch out-of-scope files.

**Success criteria**

- In-scope files prefer `[]` and `??` / `??=` where applicable.
- `composer lint` passes; no functional regressions.

**Lint after Phase 2:** 1 pre-existing error (`tests/phpunit/bootstrap.php` file comment style) + 6 warnings.

**Risk:** Low.

---

## Phase 3 — Types: helpers and small utilities

**Status:** Done

**Goal:** Add native param/return types to pure helpers and small static utilities.

**Target files (examples)**

- `inc/base.php`
- `inc/partners.php`
- `inc/settings.php`
- `inc/jetpack.php`
- `inc/Data.php`
- `inc/AdminBar.php`
- `inc/ai-page-designer-config.php`

**Tasks**

1. Add return types (`bool`, `string`, `array`, `void`, nullable forms, etc.) matching existing PHPDoc/behavior.
2. Add parameter types for scalars and known WP types.
3. Add typed properties where straightforward (e.g. `Data::$ai_sitegen_brand`: `string`).
4. Keep PHPDoc for complex array shapes; tighten with `@phpstan-type` / shaped `@param` only when useful.

**Completed**

- Typed all helpers in `base.php`, `partners.php`, `settings.php`, `jetpack.php`
- Typed `Data` methods + `private static string $ai_sitegen_brand`
- Typed `AdminBar` and `AIPageDesignerDebug` methods
- Corrected `web_install_date_filter` PHPDoc return from `int` → `string` to match behavior

**Success criteria**

- Listed helpers/utilities have native types consistent with `AutoIncrement.php`.
- Lint + existing tests pass.

**Risk:** Low–medium (type errors surface real mismatches).

---

## Phase 4 — Types: Admin and widgets

**Goal:** Type the admin UI and widget layer.

**Target files**

- `inc/Admin.php`
- `inc/widgets/SitePreview.php`
- `inc/widgets/bootstrap.php`
- `inc/widgets/views/site-preview.php` (PHP portions only; be careful with mixed view code)

**Tasks**

1. Add return/param types to public/static methods.
2. Type hook callbacks carefully (WP often passes mixed/`null`; prefer accurate nullable types over overly strict ones).
3. Avoid changing method names or hook registration signatures.

**Success criteria**

- Admin/widget classes typed; admin screens and widget still load.
- Lint passes.

**Risk:** Medium (admin bootstrap paths).

---

## Phase 5 — Types: REST controllers

**Goal:** Add types to REST API controllers without breaking WP REST contracts.

**Target files**

- `inc/RestApi/SettingsController.php`
- `inc/RestApi/CachingController.php`
- `inc/RestApi/rest-api.php`

**Tasks**

1. Type methods with `\WP_REST_Request`, `\WP_REST_Response`, `bool`, etc., aligning with parent `WP_REST_Controller` where overridden.
2. Prefer typed `$namespace` property (`string`) if compatible with parent.
3. Smoke-test settings and caching routes (permission checks, GET/POST).

**Success criteria**

- Controllers use native types; REST routes still register and respond correctly.
- Lint passes.

**Risk:** Medium (override signature compatibility with WP core).

---

## Phase 6 — Types: compat-check classes and remaining first-party

**Goal:** Finish typing remaining in-scope first-party code, including early-bootstrap compat classes.

**Target files**

- `inc/plugin-php-compat-check.php`
- `inc/plugin-nfd-compat-check.php`
- `inc/updates.php`
- `inc/upgrades/*.php` (as applicable)
- `bootstrap.php` / `wp-plugin-web.php` (only where safe)
- Any remaining untyped in-scope methods from earlier phases

**Tasks**

1. Add PHP 7.4 typed properties on compat-check classes (`string`, `array`, `\WP_Error`, etc.).
2. Add param/return types to methods.
3. Convert remaining `isset() ? :` → `??` if any left.
4. Be conservative: these classes run before full plugin load; prefer correct nullable types and avoid fatal type errors on edge inputs.

**Success criteria**

- Compat-check and remaining in-scope files typed.
- Plugin activates/deactivates correctly when requirements fail or pass.
- Lint passes.

**Risk:** Medium–high (early load path).

---

## Phase 7 — Guardrails and ongoing standards

**Goal:** Prevent regressions and make modern PHP the default for new code.

**Tasks**

1. Optionally introduce PHPStan (start level 1–3) modeled after patterns in `AutoIncrement.php`.
2. Wire analysis into Composer scripts (e.g. `composer analyse`) and CI if adopted.
3. Document contributor rule: new first-party PHP follows AutoIncrement-level typing; no new `array()` in in-scope code.
4. Optionally ratchet PHPCS/Newfold rules that encourage short arrays and types.
5. Keep vendor modules and `onboarding-access-control.php` explicitly excluded from this initiative’s CI path if needed.

**Success criteria**

- Clear ongoing standard for new code.
- Optional static analysis gate in place or explicitly deferred with rationale.

**Risk:** Low (tooling); medium if PHPStan level is set too high initially.

---

## Delivery checklist (phase-wise)

| Phase | Focus | Suggested PR |
|-------|--------|----------------|
| 1 | Align PHP 7.4 floor (composer + phpcs) | Config-only |
| 2 | Short arrays + `??` / `??=` (+ light `fn()`) | Mechanical syntax |
| 3 | Types: helpers + Data / AdminBar / config | Types batch A |
| 4 | Types: Admin + widgets | Types batch B |
| 5 | Types: REST controllers | Types batch C |
| 6 | Types: compat-check + remaining | Types batch D |
| 7 | PHPStan / CI / contributor standards | Guardrails |

Execute **one phase at a time**. After each phase: lint, smoke-test relevant flows, then proceed.

## Success criteria (overall)

- Platform / PHPCS / header all say PHP **7.4+**
- In-scope first-party code consistently uses `[]`, `??`/`??=`, and native types
- `composer lint` clean; PHPUnit green
- Vendor and `inc/onboarding-access-control.php` untouched by this initiative
- New in-scope code matches `AutoIncrement.php` typing expectations
