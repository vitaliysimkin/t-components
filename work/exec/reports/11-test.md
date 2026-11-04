# Step 11: test (a88ae51, issue 03)

**PASS**

- Repo: lint, test (245/245), build:nocheck, check:pack, check:types (attw: no problems, `internal-resolution-error` no longer ignored), check:size: all exit 0. `dist/*.js|cjs` contain no `vue-router`.
- `npm pack` → `/tmp/tc-test/node` without `vue-router`:
  - (a) Node ESM `import()` and CJS `require()` of the main entry work (51 exports, TSidebar/TBottomNav present); `./icons` works in both.
  - (b) `tsc --noEmit --strict --skipLibCheck false` passes with NodeNext and with bundler, covering main, `./icons` (side-effect import), `./markdown`, `./code-editor` and `./global`, plus a `.cts` CJS check. The types are real: negative controls (`const x: number = TButton/TSidebar/TBottomNav`, `{nope:1} = Md/Ce`) fail with concrete component/module types, and none of them are `any`.
  - (c) Vite + Vue + vue-router app (`/tmp/tc-test/app`, prod build + preview), Playwright/Chromium: TSidebar and TBottomNav render `<a href>`. Clicking navigates as an SPA (no reload). The active item (`--active`) follows the route in both components, including on Back. No page or console errors.
- Notes (not regressions, non-blocking):
  - `dist/icons/index.d.ts` is empty, and was already empty in the published 1.5.0. Because of this, `import * as X from '.../icons'` gives TS2306, while the documented side-effect import works.
  - publint warning about `types` under `require`: pre-existing.
  - Without a router installed, TSidebar/TBottomNav will crash when rendered (`$route` undefined). This is expected since they require a router.
  - `package.json` version is still 1.5.0 (not bumped, as the dev report states).
