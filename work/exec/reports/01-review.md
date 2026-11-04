# Review, step 1 (commit 9afe345)

Verdict: PASS

Scope matches the plan: K12, K13 (test only, no code change) and K15, plus CHANGELOG lines. TButton and other props are untouched.

Required fixes: none.

Optional nits (not blocking):
- CHANGELOG TDropdown entry: the clause "Вигляд задано на самій панелі, тож overflow не обрізає тінь" is extra and can be dropped.
- TButtonGroup test checks a precondition (no default button in the form) rather than real Enter behaviour. This is acceptable because happy-dom has no implicit submission, and the test comment explains it.
- `.t-dropdown-panel.is-card` uses tokens only, no hex or px values. OK.
