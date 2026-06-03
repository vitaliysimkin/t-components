import { addCollection, addIcon } from '@iconify/vue'
import { icons as systemUicons } from '@iconify-json/system-uicons'

// ---------------------------------------------------------------------------
// Offline icon registration. Imported as a side-effect by <TIcon> so the
// library (and its consumers) never need a network call to api.iconify.design.
//
// Developer model:
//   - `system-uicons:*` — the whole system-uicons set, bundled wholesale.
//   - `ticon:*`         — the library's curated, hand-picked offline set
//                         (inlined below). These are the glyphs the components
//                         use as their defaults.
//   - anything else     — unknown / unregistered → loud `ticon:missing`
//                         fallback rendered by <TIcon>.
//
// Curated `ticon:*` set:
//   ticon:missing        (fallback bug glyph)
//   ticon:info
//   ticon:check-circle
//   ticon:warning
//   ticon:error
//   ticon:close
//   ticon:calendar
//   ticon:calendar-clock
//   ticon:clock
//   ticon:inbox
//   ticon:unfold
//   ticon:arrow-up
//   ticon:arrow-down
//
// Licensing:
//   - system-uicons: bundled wholesale under its own licence.
//   - ticon:* glyphs are Material Symbols (Apache-2.0,
//     https://www.apache.org/licenses/LICENSE-2.0) inlined as literals,
//     EXCEPT ticon:missing which is a Solar icon (CC BY 4.0,
//     https://creativecommons.org/licenses/by/4.0/) recoloured to #e11d48.
// ---------------------------------------------------------------------------

// Whole system-uicons set, bundled offline.
addCollection(systemUicons)

// Fallback glyph shown by <TIcon> for unknown icon names. Hard-coded bright
// colour (NOT currentColor) so a missing icon is immediately obvious and never
// looks like a legitimate icon. Solar "bug" icon, CC BY 4.0, recoloured to
// #e11d48.
addIcon('ticon:missing', {
  width: 24,
  height: 24,
  body:
    '<g fill="none">' +
    '<path stroke="#e11d48" stroke-linecap="round" stroke-width="1.5" d="M14 21.71A7 7 0 0 1 5 15v-3.062A3.94 3.94 0 0 1 8.938 8h6.124A3.94 3.94 0 0 1 19 11.938V15a6.98 6.98 0 0 1-2 4.899"/>' +
    '<path fill="#e11d48" d="M8.25 7.5a.75.75 0 0 0-1.5 0zm-.615-2.917a.75.75 0 1 0 1.246.834zM17.25 8.5v-1h-1.5v1zm-10.5-1v1h1.5v-1zm10.5 0c0-2.9-2.35-5.25-5.25-5.25v1.5a3.75 3.75 0 0 1 3.75 3.75zM12 2.25a5.25 5.25 0 0 0-4.365 2.333l1.246.834A3.75 3.75 0 0 1 12 3.75z"/>' +
    '<path stroke="#e11d48" stroke-linecap="round" stroke-width="1.5" d="M19 14h3M5 14H2M14.5 3.5L17 2M9.5 3.5L7 2m13.5 18l-2-.8m2-11.2l-2 .8M3.5 20l2-.8M3.5 8l2 .8M12 21.5V15"/>' +
    '</g>',
})

// --- Curated ticon:* set (Material Symbols, Apache-2.0, inlined) -----------

// material-symbols:info-outline
addIcon('ticon:info', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M11 17h2v-6h-2zm1.713-8.287Q13 8.425 13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9t.713-.288M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/>',
})

// material-symbols:check-circle-outline
addIcon('ticon:check-circle', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/>',
})

// material-symbols:warning-outline
addIcon('ticon:warning', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M1 21L12 2l11 19zm3.45-2h15.1L12 6zm8.263-1.287Q13 17.425 13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18t.713-.288M11 15h2v-5h-2zm1-2.5"/>',
})

// material-symbols:error-outline
addIcon('ticon:error', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M12.713 16.713Q13 16.425 13 16t-.288-.712T12 15t-.712.288T11 16t.288.713T12 17t.713-.288M11 13h2V7h-2zm1 9q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/>',
})

// material-symbols:close
addIcon('ticon:close', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"/>',
})

// material-symbols:calendar-month-outline
addIcon('ticon:calendar', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6zm7 6q-.425 0-.712-.288T11 13t.288-.712T12 12t.713.288T13 13t-.288.713T12 14m-4.712-.288Q7 13.426 7 13t.288-.712T8 12t.713.288T9 13t-.288.713T8 14t-.712-.288M16 14q-.425 0-.712-.288T15 13t.288-.712T16 12t.713.288T17 13t-.288.713T16 14m-4 4q-.425 0-.712-.288T11 17t.288-.712T12 16t.713.288T13 17t-.288.713T12 18m-4.712-.288Q7 17.426 7 17t.288-.712T8 16t.713.288T9 17t-.288.713T8 18t-.712-.288M16 18q-.425 0-.712-.288T15 17t.288-.712T16 16t.713.288T17 17t-.288.713T16 18"/>',
})

// material-symbols:calendar-clock-outline
addIcon('ticon:calendar-clock', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M5 8h14V6H5zm0 0V6zm0 14q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v5.675q-.475-.225-.975-.375T19 11.075V10H5v10h6.3q.175.55.413 1.05t.562.95zm9.463-.462Q13 20.075 13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23t-3.537-1.463m5.212-1.162l.7-.7L18.5 17.8V15h-1v3.2z"/>',
})

// material-symbols:schedule-outline
addIcon('ticon:clock', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="m15.3 16.7l1.4-1.4l-3.7-3.7V7h-2v5.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.325 0 5.663-2.337T20 12t-2.337-5.663T12 4T6.337 6.338T4 12t2.338 5.663T12 20"/>',
})

// material-symbols-light:inbox-outline
addIcon('ticon:inbox', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M5.616 20q-.691 0-1.153-.462T4 18.384V5.616q0-.691.463-1.153T5.616 4h12.769q.69 0 1.153.463T20 5.616v12.769q0 .69-.462 1.153T18.384 20zm0-1h12.769q.269 0 .442-.173t.173-.442v-2.77h-3.577q-.557.95-1.46 1.476T12 17.616t-1.963-.525t-1.46-1.475H5v2.769q0 .269.173.442t.443.173m8.109-2.934q.775-.55 1.075-1.45H19v-9q0-.27-.173-.443T18.385 5H5.615q-.269 0-.442.173T5 5.616v9h4.2q.3.9 1.075 1.45t1.725.55t1.725-.55M5.615 19H5h14z"/>',
})

// material-symbols-light:unfold-more
addIcon('ticon:unfold', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="m12 20.27l-3.846-3.847l.719-.72L12 18.832l3.127-3.127l.72.719zM8.873 8.32l-.72-.72L12 3.754L15.846 7.6l-.719.72L12 5.191z"/>',
})

// material-symbols-light:arrow-upward
addIcon('ticon:arrow-up', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M11.5 19V6.921l-5.792 5.793L5 12l7-7l7 7l-.708.714L12.5 6.92V19z"/>',
})

// material-symbols-light:arrow-downward
addIcon('ticon:arrow-down', {
  width: 24,
  height: 24,
  body:
    '<path fill="currentColor" d="M11.5 5v12.079l-5.792-5.792L5 12l7 7l7-7l-.708-.713l-5.792 5.792V5z"/>',
})
