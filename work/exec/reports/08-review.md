# Review of step 8 (4f1ea28)

Verdict: FAIL (one small fix)

## Checked
- Optional peer dependencies are required by the plan. Step 8 says: "Add `codemirror` and the `@codemirror/*` packages the library imports to `peerDependencies` with `peerDependenciesMeta.optional`".
- Step 9 repeats the approach for `@codemirror/search`. `vite.config.ts` already lists them as `external`, so the change only declares what was already external.
- The main entry is not broken. Static imports of CodeMirror in `src` are `import type` only, and runtime imports are all dynamic `import()`. Consumers who don't use `TCodeEditor` or `TDiffEditor` need nothing installed. Optional peers don't force an install and don't warn.
- The set of declared peers matches what the code imports: `codemirror`, `view`, `state`, `merge`, `theme-one-dark`, and `lang-json`, `lang-markdown`, `lang-xml`. Nothing extra is declared.
- The code is lean. `code-language.ts` removes the duplicated language `switch`. The CSS is minimal. The new props match the step's task, and `readonlyOriginal` and `originalLabel` are in the task list. No scope creep.
- I could not find `work/feedback/2026-11-04-t-components.md` in t-components. The copy in t-platform has nothing on peers or CodeMirror, so the plan is the only source for this decision.

## Required fix
1. Tighten `.size-limit.json` in this step. Core is 5.77 KB against a 180 KB limit, and Full is 29.25 KB against 205 KB. The old limits were sized when `@codemirror/*` counted toward the measurement. They no longer catch any regression, and the step's own check is "size via the new peer deps". Set Core to about 10 KB and Full to about 40 KB. These are suggestions, not measured values. Leave Icons, Markdown and Styles unchanged. Deferring this, as the dev report does, leaves limits that guard nothing.
