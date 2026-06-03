import { addCollection } from '@iconify/vue'
import { icons as systemUicons } from '@iconify-json/system-uicons'
import './ticon-set'

// ---------------------------------------------------------------------------
// Optional offline icon registration, imported via
// `@vitaliysimkin/t-components/icons` ONCE at app startup. Registers the whole
// `system-uicons` set (bundled wholesale) plus the curated `ticon:*` set, so
// `system-uicons:*` names render without any network call to
// api.iconify.design.
//
// This subpath is heavy (it inlines the entire system-uicons collection) and
// is therefore OPT-IN: the library core does NOT import it. Components work
// out of the box with just the curated `ticon:*` set (auto-registered by
// <TIcon>); import this module only if you also want offline `system-uicons:*`.
//
// Licensing:
//   - system-uicons: bundled wholesale under its own licence.
//   - ticon:* glyphs: see ./ticon-set.
// ---------------------------------------------------------------------------

// Whole system-uicons set, bundled offline.
addCollection(systemUicons)
