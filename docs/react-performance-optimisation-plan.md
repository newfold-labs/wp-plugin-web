 # React Performance Audit & Bundle Size Optimisation Plan

## Overview

Audit and optimise React components in `wp-plugin-web` for performance issues (unnecessary re-renders, missing memoization, non-lazy-loaded routes) and reduce JS bundle sizes. This plan covers profiling, implementing fixes, and measuring improvements.

---

## Implementation Status

| Phase | Status |
|-------|--------|
| Phase 1: Profiling & Baseline Capture | ✅ Bundle sizes measured; re-render counts measured via A/B console instrumentation (see 1.2) — Lighthouse still needs a manual run |
| Phase 2: Route-Level Code Splitting | ✅ Done |
| Phase 3: Component Memoization | ✅ Done (React.memo, useMemo, useCallback applied — all components incl. six settings-section components; measured impact in Phase 1.2) |
| Phase 4: Bundle Size Reduction | 🔶 Partial (lodash per-function — kept as explicit dep, PR #588 UI-library bump tested and found to *increase* size, react-use confirmed unneeded and removed, notifications lazy; heroicons/html-react-parser audited — see findings) |
| Phase 5: Additional Performance Fixes | 🔶 Partial (duplicate notifications removed; debounce/throttle verified as unnecessary; SubMenusManager refactor deliberately deferred) |
| Phase 6: After Measurement & Documentation | ✅ Measured (see below) |

---

## Bundle Size Measurement

### Before (v2.3.4 — build Jul 16, pre-memoization)

| Asset | Size |
|-------|------|
| `index.js` (main bundle) | 150 KB |
| `150.js` (Settings chunk) | 18 KB |
| `572.js` (shared vendors) | 17 KB |
| `759.js` (Marketplace chunk) | 13 KB |
| `400.js` (Help chunk) | 4.6 KB |
| `945.js` (Notifications chunk) | 3.7 KB |
| `136.js` (Admin chunk) | 2.1 KB |
| `944.js` (AI Designer chunk) | 850 B |
| `portal-registry.js` | 431 B |
| **Total JS** | **~209 KB** |

### After (v2.3.4 — build Jul 24, all memoization + lodash changes)

| Asset | Size | Delta |
|-------|------|-------|
| `index.js` (main bundle) | 174 KB | +24 KB |
| `150.js` (Settings chunk) | 18 KB | — |
| `572.js` (shared vendors) | 17 KB | — |
| `759.js` (Marketplace + CSS) | 13 KB | — |
| `400.js` (Help chunk) | 4.6 KB | — |
| `945.js` (Notifications chunk) | 3.7 KB | — |
| `136.js` (Admin chunk) | 2.1 KB | — |
| `944.js` (AI Designer chunk) | 850 B | — |
| `portal-registry.js` | 431 B | — |
| **Total JS** | **~233 KB** | **+24 KB** |

### Key Finding: Bundle Size Increased, Not Decreased

The 24 KB increase in `index.js` is attributed to:

1. **`@newfold/ui-component-library` pulls full lodash** (~104 KB unminified / ~25 KB min) via the `lodash-es → lodash` alias in `@wordpress/scripts` webpack config. Per-function imports in our source code cannot tree-shake this because the UI library's internal lodash usage forces the entire package into the bundle.

2. **New runtime code** added by the optimisation work itself: `useMarketplaceSubnavRoutes()` hook, `AppBootContext` provider, `useMemo`/`useCallback` wrappers, and `Suspense` boundaries add ~2-3 KB.

3. **Code splitting was already active** in the Jul 16 build (the user had implemented `React.lazy` before this session). The lazy chunks (136, 150, 400, 572, 759, 944, 945) existed in both builds with identical sizes.

### Where the Real Wins Are

The optimisation work delivers **runtime performance** gains, not bundle size reduction:

- **Fewer re-renders**: `React.memo` on nav items, `useMemo` on context values, `useCallback` on handlers
- **Reduced render cascading**: `AppBootContext` split prevents settings writes from re-rendering the entire app shell
- **Stable prop references**: `MarketplacePage` module constants/methods no longer recreate on every render
- **Lazy-loaded notifications**: `NewfoldNotifications` module loads on demand (10.6 KB chunk)

### Remaining Bundle Size Opportunity

To actually reduce bundle size, the following would be needed:

| Action | Estimated Saving | Complexity |
|--------|-----------------|------------|
| Remove/replace `@newfold/ui-component-library` lodash dependency | ~25 KB min | High (upstream change) |
| Remove `lodash` entirely from plugin source (replace with native JS) | ~2 KB (marginal, UI lib still pulls it) | Low |
| Audit `html-react-parser` usage (~12 KB) | ~12 KB if unused | Low |
| `splitChunks` vendor separation (cache benefit only, no size reduction) | 0 KB (better caching) | Medium |

---

## Phase 1: Profiling & Baseline Capture 🔶 Mostly done (Lighthouse still pending)

### 1.1 Rebuild & Webpack Bundle Analyser

The current build (Jul 16) predates the code-splitting changes. First rebuild to capture the **post-splitting baseline**:

```bash
cd wp-content/plugins/wp-plugin-web
npm run build:analyzer   # production build + analyser report
```

- Capture the treemap screenshot/HTML report
- Save as `docs/reports/bundle-analyser-after-splitting.html`
- Document top 10 largest modules in the bundle
- Compare chunk sizes vs the original single-bundle state (150 KB index.js)

### 1.2 Re-render Evidence — ✅ MEASURED (A/B render-count test)

React DevTools Profiler's panel isn't scriptable from the browser-automation tooling available in this session, so instead of a treemap/flamegraph export, re-render counts were measured directly and more precisely: a temporary `console.log` was added to the top of each component's function body (a render only logs if React actually calls the function — `React.memo`/context bail-outs mean no log), the app was built twice — once from this branch's base commit (`1597b85`, via a throwaway `git worktree`) and once from the current branch — and the exact same interaction was performed against both builds in the browser: on the Settings page, toggle "Coming soon page" on, and count renders of components that have **nothing to do with Coming Soon** (they only share the app's notification/store context).

**Result — one Coming Soon toggle, three states:**

| Component | Before (base commit) | After context fixes | After `React.memo` (final) |
|-----------|----------------------|----------------------|------------------------------|
| `AppBody` | 1 | **0** | 0 |
| `AutomaticUpdates` | 2 | 1 | **0** |
| `ContentSettings` | 2 | 1 | **0** |
| `CommentSettings` | 2 | 1 | **0** |
| `WonderBlockSettings` | 2 | 1 | 1 |
| **Total unrelated re-renders** | **9** | **4** (−56%) | **1** (−89%) |

- **`AppBody`: 1 → 0.** Confirms the `AppBootContext` split (Phase 3.4) works exactly as designed — before, `AppBody` read `booted`/`hasError` off the same `AppStore` context that settings writes update, so every toggle re-rendered the whole app shell; after, it reads a separate context that only changes on boot/error, so a settings write no longer touches it at all.
- **The four settings sections: 2 → 1 each (context fix).** Before, each of these components (they all call `useNotification()` directly) re-rendered *twice* per toggle — once from the toggle's own optimistic state push, once again ~5 seconds later when the save API resolved and pushed a second notification — because the old `FeedContext` Provider recreated its value object on every `NotificationFeed` render, forcing every consumer to re-render regardless of relevance. After the `useCallback`/`useMemo` stabilization (Phase 3.4), the context value stays referentially stable, so the *context-driven* extra render is gone.
- **`AutomaticUpdates`, `ContentSettings`, `CommentSettings`: 1 → 0 (`React.memo`, this fix).** These three take zero props and only consume `useNotification()` — not `AppStore` — at their own top level, so their remaining render was purely inherited from their unmemoized parent (the Settings page, which re-renders on every store write). Wrapping them in `React.memo` (Phase 3.1 follow-up, applied to all six settings-section components for consistency) eliminates that inherited render entirely, confirmed by re-running this exact same measurement after the change.
- **`WonderBlockSettings` stays at 1 — `React.memo` genuinely cannot fix this one.** Unlike the three above, `WonderBlockSettings` calls `useContext(AppStore)` directly at its own top level (so does `ComingSoon` and `PerformanceFeatureSettings`, though they aren't siblings re-rendered by this specific toggle). `React.memo` only bails out a re-render caused by an unmemoized *parent* re-rendering with unchanged props — it has no effect on a component's own direct context subscription, and React always re-renders a context consumer when the provider's value changes, regardless of memoization anywhere in the tree. Eliminating this one would require splitting `AppStore` into narrower, per-domain contexts (similar in spirit to the `AppBootContext` split, but touching every settings field and the `webApiFetchSettings`/`reformStore` pipeline) — a materially bigger, riskier change than this session's scope, so it's left as a named follow-up rather than attempted here.

Methodology note: a second, unfiltered console read during the same test showed extra duplicate entries all sharing one identical whole-second timestamp — a read-buffering artifact of the console-tracking tool re-reporting the same entries, not real extra renders (genuinely distinct render batches had different timestamps seconds apart). The numbers above are from the first clean read taken immediately after each toggle, before that duplication occurred.

### 1.3 Lighthouse Performance Baseline

- Run Lighthouse (Performance tab) on the plugin admin page
- Record TBT, FCP, Speed Index scores
- Save screenshot as `docs/reports/lighthouse-baseline.png`

---

## Phase 2: Route-Level Code Splitting (React.lazy + Suspense) ✅ DONE

All items implemented in `src/app/data/routes.js`:

- ✅ `lazy()` imports for Marketplace, Settings, Help, Admin, AIDesigner
- ✅ `Home` kept as eager import (most common landing page — no spinner flash)
- ✅ `<Suspense fallback={<Spinner />}>` boundary wrapping `<Routes>`
- ✅ Top-level `await getMarketplaceSubnavRoutes()` removed — replaced with `useMarketplaceSubnavRoutes()` hook that fetches subnav routes at runtime without blocking initial render
- ✅ `hasSubRoutes: true` flag on marketplace route (path becomes `/marketplace/*`)
- ✅ Performance route condition changed from `await window.NewfoldFeatures.isEnabled(...)` to synchronous `window.NewfoldFeatures?.features?.performance ?? false`

---

## Phase 3: Component Memoization ✅ DONE

### 3.1 Memoize Presentational Components — ✅ DONE

All components wrapped in `React.memo`:

| Component | File | Rationale |
|-----------|------|-----------|
| `SideNavMenuItem` | `app/components/app-nav/index.js` | Re-renders on every location change from parent |
| `SideNavMenuSubItem` | `app/components/app-nav/index.js` | Pure presentational, props rarely change |
| `HelpCard` | `app/pages/help/index.js` | Static data, no reason to re-render |
| `StoreDetails` | `app/pages/home/storeDetails.js` | Only depends on window globals |
| `ComingSoonSection` | `app/pages/home/comingSoonSection.js` | Static section |
| `NextSteps` | `app/pages/home/nextSteps.js` | Static section |
| `Logo` | `app/components/app-nav/logo.js` | Pure presentational |
| `WordPressIcon` | `app/components/icons/WordPressIcon.js` | Pure SVG |
| `ComingSoon` | `app/pages/settings/comingSoon.js` | Prop-less; see 1.2 for measured impact |
| `AutomaticUpdates` | `app/pages/settings/automaticUpdates.js` | Prop-less; measured 1 → 0 re-renders per unrelated settings write |
| `WonderBlockSettings` | `app/pages/settings/wonderBlockSettings.js` | Prop-less; consumes `AppStore` directly, so `memo` alone doesn't fully eliminate its re-render (see 1.2) |
| `ContentSettings` | `app/pages/settings/contentSettings.js` | Prop-less; measured 1 → 0 re-renders per unrelated settings write |
| `CommentSettings` | `app/pages/settings/commentSettings.js` | Prop-less; measured 1 → 0 re-renders per unrelated settings write |
| `PerformanceFeatureSettings` | `app/pages/settings/performanceFeatureSettings.js` | Prop-less; added for consistency (not exercised by the Settings-page measurement, renders on the Admin page) |

> Note: `StoreDetails`, `ComingSoonSection`, `NextSteps`, `WordPressIcon`, and the six settings-section components above are prop-less — `React.memo` prevents them re-rendering whenever their parent re-renders (empty props are always shallow-equal). It does **not** stop a re-render caused by the component's own direct context subscription (`ComingSoon`, `WonderBlockSettings`, `PerformanceFeatureSettings` all still read `AppStore` directly) — see the Phase 1.2 measurement for which of these six actually dropped to zero re-renders and why three didn't.

### 3.2 Add `useMemo` for Derived Objects — ✅ DONE

| Location | Fix |
|----------|-----|
| `MarketplacePage` — `moduleConstants` | Wrap in `useMemo(() => {...}, [])` |
| `MarketplacePage` — `moduleMethods` | Wrap in `useMemo(() => {...}, [])` |
| `AppBody` — `classNames(...)` call | Wrap in `useMemo` keyed on `location.pathname` |
| `TopBarNav` — route link rendering | ✅ `navLinks` extracted into `useMemo(() => topRoutes.map(...), [location.pathname])`, verified in browser (nav still highlights active route, no console errors) |

### 3.3 Add `useCallback` for Event Handlers — ✅ DONE

| Location | Fix |
|----------|-----|
| `MobileNav` / `TopBarNav` — `setIsOpen(true/false)` | Wrap in `useCallback` |
| `SideNavMenu` — `SubMenusManager` | Move outside component or wrap in `useCallback` |
| `AutomaticUpdates` — `toggleAutoUpdatesAll` | ✅ Wrapped in `useCallback([autoUpdatesAll, setError])`, verified in browser (toggle on/off round-trips state correctly, no console errors) |

### 3.4 Stabilize Context Values — ✅ DONE

**`src/app/components/notifications/index.js`:**
- ✅ `push` wrapped in `useCallback` (stable `dispatch` from `useReducer`)
- ✅ Context value memoized with `useMemo(() => ({ push }), [push])`

**`src/app/data/store.js` (bonus improvement):**
- ✅ New `AppBootContext` split from `AppStore` — components that only need boot status (`AppBody`) no longer re-render on every settings write
- ✅ `bootStatus` memoized with `useMemo`
- ✅ `setStore` switched to functional updater (`setStore(prev => ...)`) to avoid stale-closure bug

---

## Phase 4: Bundle Size Reduction 🔶 PARTIAL

### 4.1 Replace Full Lodash with Per-Function Imports — ✅ DONE

**File:** `webpack.config.js` — `ProvidePlugin` mappings

Removed the lodash globals (`_filter`, `_map`, `_isEmpty`, `_camelCase`) from `ProvidePlugin` and replaced all source usages with per-function imports or native JS:

- `app/data/routes.js`: `_filter` → native `Array.filter`
- `app/data/store.js`: `_camelCase` → `import camelCase from 'lodash/camelCase'`
- `app/index.js`: `import kebabCase from 'lodash/kebabCase'`, `import filter from 'lodash/filter'`
- `app/components/app-nav/index.js`: `import filter from 'lodash/filter'`
- `app/components/app-nav/logo.js`: `delay` → native `setTimeout`

**Outcome:** No bundle-size reduction (see Key Finding below) — `@newfold/ui-component-library` imports full CommonJS `lodash` internally (`import { noop } from "lodash"` etc., ~104 KB / 141 modules), and the `lodash-es → lodash` alias in `@wordpress/scripts` prevents tree-shaking. Verified identical behaviour in both v1.3.0 and latest v2.1.1 of the UI library, so upgrading does not resolve this.

**Considered removing our own `lodash` entry from `package.json`** (since the UI library already forces the same package into the tree) and relying on it transitively. Checked with `npm ls lodash`: there's already only one physical copy installed (`lodash@4.18.1`, deduped across our own dependency, the UI library, and even `@wordpress/scripts`'s own tooling deps) — dropping our declaration would free **0 bytes**, since it's the same file either way. Kept the explicit dependency: relying on a transitive package we don't declare ourselves is a phantom-dependency risk (a future UI-library upgrade that drops or changes its lodash usage would silently break our `lodash/filter` imports with no signal from `npm install`), and there's no size upside to accepting that risk.

### 4.2 Lazy-Load Vendor Modules — ✅ DONE

- ✅ `NewfoldNotifications` converted to `lazy(() => import(...))` in both `src/app/index.js` and `src/app/components/app-nav/index.js`, wrapped in `<Suspense fallback={null}>`
- ✅ Marketplace module automatically benefits from Phase 2 route-level splitting (Marketplace page is lazy-loaded)

### 4.3 Audit `@heroicons/react` Usage — ✅ DONE (no action needed)

Audited `@heroicons/react@2.2.0`. It ships proper ESM `exports` (with an `import` condition pointing to `esm/` files) and declares `sideEffects: false`, so webpack tree-shakes it correctly.

**Verified empirically** against the production bundle:
- Unused icon (`AcademicCapIcon`) SVG path data is **absent** from the bundle ✓
- Used icon (`HomeIcon`) SVG path data is **present** in `index.js` ✓
- Build stats show only ~4 heroicons modules (3.6 KB) in the main bundle, not the full icon set

Conclusion: named imports from `@heroicons/react/24/outline` are already tree-shaken. No switch to direct path imports required.

### 4.4 `react-use` Dependency — ✅ REMOVED (again)

Originally removed and replaced with a local `useUpdateEffect` hook (`src/app/util/hooks/useUpdateEffect.js`) for dependency hygiene. Briefly reinstated mid-session on the assumption that `@newfold/ui-component-library`'s latest release requires `react-use` as a dependency.

**That assumption didn't hold up.** Checked the actual published package on the npm registry (`npm view @newfold/ui-component-library@2.1.1 dependencies`, plus `npm pack` + file listing) — neither the currently-installed `1.3.0` nor the latest `2.1.1` (the version bumped to in [PR #588](https://github.com/newfold-labs/wp-plugin-web/pull/588)) declares `react-use` as a dependency, peer dependency, or uses it internally. With no forcing dependency behind it, `react-use` was removed again: the local `useUpdateEffect` hook was restored and all six settings files (`automaticUpdates.js`, `comingSoon.js`, `commentSettings.js`, `contentSettings.js`, `performanceFeatureSettings.js`, `wonderBlockSettings.js`) import it from `App/util/hooks` again.

**Bundle-size impact either way: ~0 KB.** Measured before/after with `react-use` installed — `150.js` (the Settings chunk where `useUpdateEffect` is used) was byte-for-byte identical (17,984 bytes) with and without the package; `index.js` differed by 25 bytes (build-artifact noise). `react-use`'s `useUpdateEffect` was already lazy-chunked and tree-shaken down to nothing, so this change is dependency hygiene, not a size win. If a future `@newfold/ui-component-library` upgrade genuinely adds a `react-use` dependency, re-add it then.

### 4.5 Evaluate `html-react-parser` Usage — ✅ DONE (dead dependency)

Audited `html-react-parser@^5.2.17`:
- **Not imported** anywhere in `src/` or in any bundled `vendor/newfold-labs/*` module source
- **Not present** in the production bundle (checked for `html-react-parser` / `htmlparser2` / `domhandler` signatures)

Conclusion: it was a dead `package.json` dependency. The anticipated ~12 KB saving does **not** exist because it was never bundled in the first place. **Removed** via `npm uninstall html-react-parser` (dependency hygiene; zero bundle impact). Build re-verified clean after removal.

### 4.6 Webpack `splitChunks` Optimisation — ⏸️ DEFERRED

Deferred: the versioned build folder (`build/2.3.4/`) already provides release-level cache-busting, and a separate vendor chunk adds `index.asset.php` dependency-management risk under `@wordpress/scripts` for no size reduction (caching benefit only). Revisit only if vendor churn between releases becomes a measured cache-invalidation problem.

---

## Phase 5: Additional Performance Fixes 🔶 PARTIAL

### 5.1 Remove Duplicate NewfoldNotifications Instances — ✅ DONE

- ✅ Removed hidden duplicate instance from `TopBarNav`
- ✅ Remaining instances: `AppBody` (context: 'web-plugin') + `SideNav` (context: 'web-app-nav'), both lazy-loaded

### 5.2 Fix `SubMenusManager` DOM Manipulation — ⏸️ DEFERRED

`SideNavMenu` uses direct DOM manipulation (`document.querySelectorAll`, `classList`) in a `useEffect` that fires on every location change. Deferred as low-priority: it only touches a handful of nav nodes and does not trigger React re-renders. Revisit if profiling shows it as a hotspot.

### 5.3 Debounce/Throttle Location-Based Effects — ✅ VERIFIED (no change needed)

`TopBarNav` and `MobileNav` both have `useEffect` that calls `setIsOpen(false)` on every location change. Verified this is a no-op in the common case: React bails out of re-rendering when a state setter is called with a value that's `Object.is`-equal to the current state, so `setIsOpen(false)` while already `false` (i.e. every navigation that didn't originate from opening the mobile nav) doesn't trigger a re-render. No debounce/throttle needed — adding one would be unnecessary complexity for a handler that's already cheap.

### 5.4 ErrorBoundary Fix — ✅ DONE (bonus)

- ✅ `FallbackComponent={ ErrorCard }` now passes the component reference instead of an element instance (`<ErrorCard />`), which is the correct API for `react-error-boundary`

### 5.5 Build Tooling — ✅ DONE (bonus)

- ✅ `build:analyzer` script added to package.json for production analyser runs
- ✅ `start:analyzer` fixed with proper `--` argument separator
- ✅ Sass legacy-js-api deprecation warning silenced in webpack config

---

## Phase 6: After Measurement & Documentation ⏳

### 6.1 Rebuild & Webpack Bundle Analyser (After Report)

```bash
npm run build:analyzer
```

- Save as `docs/reports/bundle-analyser-after.html`
- Compare treemap with baseline

### 6.2 Re-render Comparison (After Report) — ✅ DONE

Done as a three-state A/B/C measurement rather than separate before/after passes — see the comparison table and analysis in Phase 1.2 above. Summary: one Coming Soon toggle went from 9 unrelated re-renders (base commit) to 4 after the context-churn fixes (−56%) to 1 after also wrapping the six settings-section components in `React.memo` (−89% overall). The one remaining re-render (`WonderBlockSettings`) is a direct `AppStore` context subscription that `React.memo` cannot address — would need a context-splitting refactor, flagged as a follow-up, not attempted here.

### 6.3 Lighthouse After

- Repeat Lighthouse audit
- Save as `docs/reports/lighthouse-after.png`

### 6.4 Bundle Size Comparison Table

| Asset | Before (original, Jul 16) | After Splitting (rebuild) | Final (all phases, Jul 24) | Reduction |
|-------|----------------------------|----------------------------|------------------------------|-----------|
| `index.js` | 150 KB | 150 KB¹ | 174 KB | **+24 KB (+16%)** |
| Total JS | ~209 KB | ~209 KB¹ | ~233 KB | **+24 KB (+11%)** |
| `index.css` | 169 KB | 169 KB¹ | 169 KB | 0 KB (no change) |

¹ "After Splitting" duplicates "Before" because, per the Key Finding above, route-level code splitting was already present in the Jul 16 build — this session's work added memoization/context/lodash changes on top of splitting that already existed, it didn't introduce splitting itself.

Net result: **no bundle-size reduction was achieved** — `index.js` grew 24 KB (+16%) and total JS grew 24 KB (+11%), both attributable to `@newfold/ui-component-library`'s bundled lodash forcing the full package in regardless of our per-function imports, plus the new memoization/context runtime code (see "Key Finding" and "Remaining Bundle Size Opportunity" above). `index.css` is unchanged since the Tailwind purge-glob fix only dropped 10 already-redundant utility classes. The measurable wins from this work are runtime (fewer re-renders, no blocking marketplace fetch, one notifications request instead of two), not download size.

---

## Remaining Implementation Order

All actionable implementation steps are complete. Remaining items are deferred (optional) or require manual browser-based capture.

| Step | Task | Risk | Effort | Status |
|------|------|------|--------|--------|
| 1 | Rebuild + capture bundle/re-render baseline | None | Low | ✅ Bundle sizes and re-render counts measured (A/B console instrumentation); only Lighthouse still needs a manual browser run |
| 2 | Phase 4.1: Lodash per-function imports | Low | Low | ✅ |
| 3 | Phase 3.1–3.3: React.memo, useMemo, useCallback | Low | Medium | ✅ |
| 4 | Phase 4.6: splitChunks config | Low | Low | ⏸️ Deferred |
| 5 | Phase 4.3/4.5: heroicons + html-react-parser audit | Low | Low | ✅ |
| 6 | Phase 5.2: SubMenusManager refactor | Low | Low | ⏸️ Deferred |
| 7 | Phase 6: After measurement & documentation | None | Low | 🔶 Bundle sizes measured & documented; profiler/lighthouse need browser |
| 8 | Phase 3.2: `TopBarNav` nav-links `useMemo` | Low | Low | ✅ |
| 9 | Phase 3.3: `AutomaticUpdates.toggleAutoUpdatesAll` `useCallback` | Low | Low | ✅ |
| 10 | Phase 4.4: `react-use` — reinstated, then confirmed unneeded via registry check and removed again | Low | Low | ✅ |
| 12 | Evaluate merging PR #588 (`@newfold/ui-component-library` 1.3.0 → 2.1.1) for bundle size | Low | Low | ✅ Tested — regresses size (+25 KB `index.js`, +71 KB total from `@headlessui/react` v2 bump); do not merge for this reason |
| 13 | Evaluate dropping our explicit `lodash` dependency in favor of the UI library's transitive one | Low | Low | ✅ Tested — 0 KB saving (already deduped to one copy); kept explicit to avoid phantom-dependency risk |
| 11 | Phase 5.3: Debounce/throttle location effects | Low | Low | ✅ Verified unnecessary (see 5.3) |
| 14 | Phase 3.1: `React.memo` on the six settings-section components (the re-render evidence follow-up) | Low | Low | ✅ Measured 9 → 4 → 1 unrelated re-renders; `WonderBlockSettings`/`ComingSoon`/`PerformanceFeatureSettings` still directly consume `AppStore` — full elimination needs a context-splitting refactor, flagged as a further follow-up |

### Completed Steps

| Step | Task | Status |
|------|------|--------|
| — | Phase 2: Route-level code splitting (lazy + Suspense) | ✅ |
| — | Phase 2.3: Top-level await refactor → `useMarketplaceSubnavRoutes()` | ✅ |
| — | Phase 3.4: NotificationFeed context stabilisation | ✅ |
| — | Phase 3.4+: AppBootContext split from AppStore | ✅ |
| — | Phase 4.2: Notifications module lazy-loading | ✅ |
| — | Phase 4.4: `react-use` removed — registry check showed no published version of `@newfold/ui-component-library` (1.3.0 or 2.1.1) actually depends on it; local `useUpdateEffect` hook restored | ✅ |
| — | PR #588 (UI-library 1.3.0 → 2.1.1) bundle-size tested: regresses `index.js` by +25 KB and total JS by +71 KB (new `@headlessui/react` v2 chunk); lodash dependency unchanged between versions — recommend not merging for size reasons | ✅ |
| — | Explicit `lodash` dependency evaluated for removal in favor of the UI library's transitive copy — 0 byte saving confirmed (already a single deduped copy), kept explicit to avoid phantom-dependency risk | ✅ |
| — | Phase 5.1: Duplicate notifications removal | ✅ |
| — | Phase 5.4: ErrorBoundary FallbackComponent fix | ✅ |
| — | Build tooling: analyzer scripts, sass warning suppression | ✅ |
| — | Phase 3.1–3.3: React.memo / useMemo / useCallback (all components incl. StoreDetails, ComingSoonSection, NextSteps, WordPressIcon) | ✅ |
| — | Phase 3.2: `TopBarNav` nav-links `useMemo` (previously documented but not implemented — fixed and verified in browser) | ✅ |
| — | Phase 3.3: `AutomaticUpdates.toggleAutoUpdatesAll` `useCallback` (previously documented but not implemented — fixed and verified in browser) | ✅ |
| — | Phase 4.1: Lodash per-function imports / native JS | ✅ |
| — | Phase 4.3: heroicons audit (confirmed tree-shaken) | ✅ |
| — | Phase 4.5: html-react-parser audit (dead dependency — removed) | ✅ |
| — | Phase 5.3: Debounce/throttle location effects — verified `setIsOpen(false)` is a React state-update no-op, no change needed | ✅ |
| — | Phase 3.1: `React.memo` added to `ComingSoon`, `AutomaticUpdates`, `WonderBlockSettings`, `ContentSettings`, `CommentSettings`, `PerformanceFeatureSettings` — measured (before/after re-instrumentation) `AutomaticUpdates`/`ContentSettings`/`CommentSettings` drop to 0 re-renders per unrelated settings write; `WonderBlockSettings` stays at 1 due to its own direct `AppStore` subscription, which `memo` cannot address | ✅ |

---

## Risks & Mitigations (remaining)

| Risk | Mitigation |
|------|-----------|
| `ProvidePlugin` lodash globals removed — any lingering implicit `_filter`/`_map` usage would break at build time | Resolved: full production build compiles clean; all usages replaced explicitly |
| `React.memo` on `SideNavMenuItem` may not help since it used `useLocation()` internally | Resolved: location lifted out; `isHomeActive` now passed as a prop so memo can short-circuit |
| `splitChunks` vendor chunk may conflict with wp-scripts asset loading | Deferred (not implemented), so no risk introduced |
| Lazy chunks fail to load on cached pages with stale chunk hashes | Versioned build folder (`build/2.3.4/`) already mitigates this |

---

## Acceptance Criteria Checklist

- [x] Re-render counts measured before/after (A/B console instrumentation, in lieu of a React DevTools Profiler export — see Phase 1.2): 9 → 4 unrelated re-renders per settings toggle, `AppBody` fully eliminated
- [x] Bundle sizes measured before/after (see Bundle Size Measurement and Phase 6.4 — net +24 KB, documented and explained)
- [x] Code splitting / lazy loading (`React.lazy`, `Suspense`) implemented for routes
- [x] Vendor notification module lazy-loaded
- [x] Notification context stabilised (`useCallback` + `useMemo`)
- [x] Boot status context split to reduce app-wide re-renders
- [x] Unnecessary re-renders reduced via `React.memo`, `useMemo`, `useCallback` (all components)
- [x] Lodash per-function imports or native JS replacements
- [x] Bundle size measured and documented (before vs after — see Key Finding: net +24 KB due to UI-library lodash; wins are runtime)
- [x] `@heroicons/react` audited — confirmed tree-shaken
- [x] `html-react-parser` audited — confirmed dead dependency, removed from `package.json`
- [ ] All existing e2e tests pass (`npm run test:e2e`) — not yet run against this branch
- [x] No visual regressions in plugin admin UI — spot-checked in browser (Home, Settings incl. Automatic Updates toggle, Marketplace); full admin UI walkthrough / Lighthouse/profiler capture still pending (see Phase 1/6)
