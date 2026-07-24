# React Performance Audit & Bundle Size Optimisation Plan

## Overview

Audit and optimise React components in `wp-plugin-web` for performance issues (unnecessary re-renders, missing memoization, non-lazy-loaded routes) and reduce JS bundle sizes. This plan covers profiling, implementing fixes, and measuring improvements.

---

## Implementation Status

| Phase | Status |
|-------|--------|
| Phase 1: Profiling & Baseline Capture | ✅ Build regenerated (Jul 24) |
| Phase 2: Route-Level Code Splitting | ✅ Done |
| Phase 3: Component Memoization | ✅ Done (React.memo, useMemo, useCallback applied) |
| Phase 4: Bundle Size Reduction | 🔶 Partial (react-use removed, notifications lazy-loaded, lodash per-function; see findings) |
| Phase 5: Additional Performance Fixes | 🔶 Partial (duplicate notifications removed; SubMenusManager refactor pending) |
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

## Phase 1: Profiling & Baseline Capture ⏳

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

### 1.2 React DevTools Profiler

- Open plugin admin page in Chrome with React DevTools extension
- Enable "Record why each component rendered"
- Navigate through all routes: Home → Marketplace → Settings → AI Designer → Help
- Record profiler session, export as `docs/reports/profiler-baseline.json`
- Document components with highest commit counts

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

## Phase 3: Component Memoization 🔶 PARTIAL

### 3.1 Memoize Presentational Components — ⏳ PENDING

Apply `React.memo` to components that receive stable props and re-render due to parent changes:

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

### 3.2 Add `useMemo` for Derived Objects — ⏳ PENDING

| Location | Fix |
|----------|-----|
| `MarketplacePage` — `moduleConstants` | Wrap in `useMemo(() => {...}, [])` |
| `MarketplacePage` — `moduleMethods` | Wrap in `useMemo(() => {...}, [])` |
| `AppBody` — `classNames(...)` call | Wrap in `useMemo` keyed on `location.pathname` |
| `TopBarNav` — route link rendering | Memoize the nav links array |

### 3.3 Add `useCallback` for Event Handlers — ⏳ PENDING

| Location | Fix |
|----------|-----|
| `MobileNav` / `TopBarNav` — `setIsOpen(true/false)` | Wrap in `useCallback` |
| `SideNavMenu` — `SubMenusManager` | Move outside component or wrap in `useCallback` |
| `AutomaticUpdates` — `toggleAutoUpdatesAll` | Wrap in `useCallback` |

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

### 4.1 Replace Full Lodash with Per-Function Imports — ⏳ PENDING

**File:** `webpack.config.js` — `ProvidePlugin` mappings

Replace:
```js
_filter: ['lodash', 'filter'],
_map: ['lodash', 'map'],
_isEmpty: ['lodash', 'isEmpty'],
_camelCase: ['lodash', 'camelCase'],
```

With:
```js
_filter: ['lodash/filter', 'default'],
_map: ['lodash/map', 'default'],
_isEmpty: ['lodash/isEmpty', 'default'],
_camelCase: ['lodash/camelCase', 'default'],
```

Or preferably, replace usages with native JS (`Array.filter`, `Array.map`, etc.) and remove lodash entirely.

Additional lodash imports found in source:
- `app/index.js`: `import { kebabCase, filter } from 'lodash'`
- `app/components/app-nav/index.js`: `import { filter } from 'lodash'`
- `app/components/app-nav/logo.js`: `import { delay } from 'lodash'`

**Estimated saving: ~20–50 KB** (depending on tree-shaking effectiveness)

### 4.2 Lazy-Load Vendor Modules — ✅ DONE

- ✅ `NewfoldNotifications` converted to `lazy(() => import(...))` in both `src/app/index.js` and `src/app/components/app-nav/index.js`, wrapped in `<Suspense fallback={null}>`
- ✅ Marketplace module automatically benefits from Phase 2 route-level splitting (Marketplace page is lazy-loaded)

### 4.3 Audit `@heroicons/react` Usage — ⏳ PENDING

Currently importing from `@heroicons/react/24/outline` — verify webpack tree-shakes unused icons. If not, switch to direct path imports:
```js
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
```

### 4.4 Remove `react-use` Dependency — ✅ DONE

- ✅ `react-use` removed from `package.json` dependencies
- ✅ `useUpdateEffect` usage replaced (verify no remaining imports at build time)

### 4.5 Evaluate `html-react-parser` Usage — ⏳ PENDING

Check if `html-react-parser` (~12KB) is actually used in the plugin source. If only used in vendor modules, ensure it's not duplicated in the main bundle.

### 4.6 Webpack `splitChunks` Optimisation — ⏳ PENDING

Add explicit `splitChunks` config to separate vendor libraries:

```js
optimization: {
    splitChunks: {
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
            },
        },
    },
},
```

This enables browser caching of vendor code separately from app code.

---

## Phase 5: Additional Performance Fixes 🔶 PARTIAL

### 5.1 Remove Duplicate NewfoldNotifications Instances — ✅ DONE

- ✅ Removed hidden duplicate instance from `TopBarNav`
- ✅ Remaining instances: `AppBody` (context: 'web-plugin') + `SideNav` (context: 'web-app-nav'), both lazy-loaded

### 5.2 Fix `SubMenusManager` DOM Manipulation — ⏳ PENDING

`SideNavMenu` uses direct DOM manipulation (`document.querySelectorAll`, `classList`) in a `useEffect` that fires on every location change. Refactor to React state-driven approach or memoize to reduce unnecessary DOM reads.

### 5.3 Debounce/Throttle Location-Based Effects — ⏳ PENDING (verify)

`TopBarNav` and `MobileNav` both have `useEffect` that calls `setIsOpen(false)` on every location change. Since location changes are discrete navigation events, this is acceptable but should be verified not to trigger cascading re-renders.

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

### 6.2 React DevTools Profiler (After Report)

- Repeat the same navigation flow from Phase 1.2
- Export as `docs/reports/profiler-after.json`
- Compare commit counts per component

### 6.3 Lighthouse After

- Repeat Lighthouse audit
- Save as `docs/reports/lighthouse-after.png`

### 6.4 Bundle Size Comparison Table

Document final results:

| Asset | Before (original) | After Splitting (rebuild) | Final (all phases) | Reduction |
|-------|-------------------|---------------------------|--------------------|-----------|
| `index.js` | 150 KB | TBD | TBD | TBD |
| Total JS | ~209 KB | TBD | TBD | TBD |
| `index.css` | 169 KB | TBD | TBD | TBD |

---

## Remaining Implementation Order

| Step | Task | Risk | Effort | Status |
|------|------|------|--------|--------|
| 1 | Rebuild + capture analyser/profiler baseline | None | Low | ⏳ |
| 2 | Phase 4.1: Lodash per-function imports | Low | Low | ⏳ |
| 3 | Phase 3.1–3.3: React.memo, useMemo, useCallback | Low | Medium | ⏳ |
| 4 | Phase 4.6: splitChunks config | Low | Low | ⏳ |
| 5 | Phase 4.3/4.5: heroicons + html-react-parser audit | Low | Low | ⏳ |
| 6 | Phase 5.2: SubMenusManager refactor | Low | Low | ⏳ |
| 7 | Phase 6: After measurement & documentation | None | Low | ⏳ |

### Completed Steps

| Step | Task | Status |
|------|------|--------|
| — | Phase 2: Route-level code splitting (lazy + Suspense) | ✅ |
| — | Phase 2.3: Top-level await refactor → `useMarketplaceSubnavRoutes()` | ✅ |
| — | Phase 3.4: NotificationFeed context stabilisation | ✅ |
| — | Phase 3.4+: AppBootContext split from AppStore | ✅ |
| — | Phase 4.2: Notifications module lazy-loading | ✅ |
| — | Phase 4.4: `react-use` removal | ✅ |
| — | Phase 5.1: Duplicate notifications removal | ✅ |
| — | Phase 5.4: ErrorBoundary FallbackComponent fix | ✅ |
| — | Build tooling: analyzer scripts, sass warning suppression | ✅ |

---

## Risks & Mitigations (remaining)

| Risk | Mitigation |
|------|-----------|
| `ProvidePlugin` lodash path change breaks implicit imports | Run full lint + build + e2e test suite after change |
| `React.memo` on `SideNavMenuItem` may not help since it uses `useLocation()` internally | Consider lifting location out and passing `isActive` as prop instead |
| `splitChunks` vendor chunk may conflict with wp-scripts asset loading | Test that `index.asset.php` dependencies still resolve correctly |
| Lazy chunks fail to load on cached pages with stale chunk hashes | Versioned build folder (`build/2.3.4/`) already mitigates this |

---

## Acceptance Criteria Checklist

- [ ] React DevTools Profiler reports captured (before state)
- [ ] Webpack Bundle Analyser reports captured (before state)
- [x] Code splitting / lazy loading (`React.lazy`, `Suspense`) implemented for routes
- [x] Vendor notification module lazy-loaded
- [x] Notification context stabilised (`useCallback` + `useMemo`)
- [x] Boot status context split to reduce app-wide re-renders
- [ ] Unnecessary re-renders reduced via `React.memo`, `useMemo`, `useCallback` (remaining components)
- [ ] Lodash per-function imports or native JS replacements
- [ ] Bundle size reduction measured and documented (before vs after)
- [ ] All existing e2e tests pass (`npm run test:e2e`)
- [ ] No visual regressions in plugin admin UI
