# Review: step 7 (K06 TPathCrumbs + K07 TFileTree), bf7bfe7

Verdict: PASS

Required fixes: none.

Checked:
- Scope matches the plan. TTree is untouched, there is no localStorage, all labels are props, the dropdowns use `TDropdown card`, and the types are exported.
- Registration, README, CHANGELOG, playground and tests cover everything "Готово, коли" asks for.
- I found no unused CSS rule, helper or prop. The helpers in `path-tree.ts` are all used.

Nits, not blocking:
- The rail `v-for` in `TFileTree.vue` builds `[...(rootFiles.length ? [null] : []), ...railDirs]` and keys the root button with `''`. It is a bit hard to read.
- `TPathCrumbs` puts a `title` on every folder span as well as on the root.
