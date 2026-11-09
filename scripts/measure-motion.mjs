// Measures every animation on the playground Animations page in headless google-chrome over CDP.
// Usage: npm run build:playground && node scripts/measure-motion.mjs [runs=3] [rates=4,6] [ids=a,b]
// Writes playground/src/motion-measurements.json (imported by AnimationsPage.vue).
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, extname, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const DIST = join(ROOT, 'playground/dist')
const OUT = join(ROOT, 'playground/src/motion-measurements.json')
const RUNS = Number(process.argv[2] ?? 3)
const RATES = (process.argv[3] ?? '4,6').split(',').map(Number)
const ONLY = process.argv[4]?.split(',') // optional ids: re-measure only these, merged into the existing JSON
const VIEWPORT = [1280, 800]
const FRAME = 1000 / 60

// Trigger per animation (row [data-anim=id]); default: click [data-m] in the row. `win` = measured window in ms,
// `anim` matches the row's own animations in the trace ("<keyframes or property> <node>") for the compositor check.
const TRIGGERS = {
  'idle': { do: 'none', win: 1000 }, // baseline: page idle, only the rAF probe runs
  'button-press': { do: 'press', sel: '.t-button', win: 450, anim: /^transform BUTTON class='t-button/ },
  'button-ripple': { do: 'press', sel: '.t-button', win: 550, anim: /t-button-ripple/ },
  'button-hover': { do: 'hover', sel: '.t-button', win: 250, anim: /^opacity ::after/ },
  'button-loading': { win: 1200, anim: /t-pulse/ },
  'button-shine': { win: 800, anim: /t-button-shine/ },
  'focus-thicken': { do: 'tab', win: 380, anim: /t-focus-thicken/ },
  'dropdown-open': { win: 250, anim: /t-dropdown-open/ },
  'select-cascade': { sel: '.t-select__trigger', win: 330, anim: /t-select-item-in/ },
  'modal-zoom': { win: 380, anim: /t-modal-(zoom|fade)/ },
  'notify-slide': { win: 380, anim: /^(transform|opacity) .*t-notification/ },
  'notify-timer': { win: 1200, anim: /t-notification-timer/ },
  'tabs-line': { sel: '.t-tabs__tab:nth-child(2)', win: 380, anim: /^transform .*t-tabs__line/ },
  'group-pill': { win: 380, anim: /^transform .*t-button-group__pill/ },
  'checkbox-press': { do: 'press', sel: '.t-checkbox__box', win: 450, anim: /^transform .*t-checkbox__box/ },
  'checkbox-mark': { win: 380, anim: /t-checkbox-turn/ },
  'input-focus': { sel: 'input', win: 380, anim: /t-ring-settle/ },
  'textarea-focus': { sel: 'textarea', win: 380, anim: /t-ring-settle/ },
  'input-error': { win: 660, anim: /t-ring-pulse/ },
  'field-shake': { win: 520, anim: /t-form-field-shake/ },
  'input-adornment': { win: 250, anim: /t-input-clear-in/ },
  'table-new-row': { win: 1100, anim: /t-flash/ },
  'table-select': { win: 250, anim: /^(transform|opacity) ::before/ },
  'table-sort': { sel: '.t-table__th:not(.t-table__th--select)', win: 380, anim: /t-table-sort-flip/ },
  'table-loading': { win: 1200, anim: /t-pulse|t-table-sweep/ },
  'badge-ring': { win: 660, anim: /t-badge-ring/ },
  'badge-dot': { win: 1200, anim: /t-badge-ring/ },
  'tag-pop': { win: 380, anim: /t-tag-pop/ },
  'copy-bubble': { sel: '.t-copy-chip', win: 1200, anim: /t-copy-chip-bubble/ },
  'card-target': { win: 1200, anim: /t-flash/ },
  'empty-cascade': { win: 490, anim: /t-empty-rise/ },
  'datepicker-zoom': { sel: '.t-date-picker__title', win: 380, anim: /t-date-picker-zoom/ },
  'logpane-flash': { win: 1100, anim: /t-flash/ },
  'logpane-edge': { do: 'wheel', sel: '.t-log-pane__lines', win: 250, anim: /^opacity ::before/ },
  'logview-flash': { win: 1100, anim: /t-flash/ },
  'crumbs-rise': { win: 250, anim: /t-path-crumbs-rise/ },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }
const round = (n) => Math.round(n * 10) / 10

if (!existsSync(join(DIST, 'index.html'))) throw new Error('Build the playground first: npm run build:playground')

// Static server for the built playground (SPA fallback to index.html).
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json' }
const server = createServer((req, res) => {
  const p = join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname))
  const file = p.startsWith(DIST) && existsSync(p) && extname(p) ? p : join(DIST, 'index.html')
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const BASE = `http://127.0.0.1:${server.address().port}`

const chromeVersion = execFileSync('google-chrome', ['--version']).toString().trim()
const profile = mkdtempSync(join(tmpdir(), 'measure-motion-'))
const debugPort = 9300 + Math.floor(Math.random() * 600)
const chrome = spawn('google-chrome', ['--headless=new', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`,
  `--window-size=${VIEWPORT.join(',')}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' })

let targets = []
for (let i = 0; i < 50 && !targets.length; i++) {
  try { targets = (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()).filter((t) => t.type === 'page') } catch { /* starting */ }
  await sleep(200)
}
const ws = new WebSocket(targets[0].webSocketDebuggerUrl)
await new Promise((r) => { ws.onopen = r })
let seq = 0
const pending = new Map()
const trace = []
let traceDone = () => {}
ws.onmessage = (msg) => {
  const d = JSON.parse(msg.data)
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d.error ? Promise.reject(new Error(d.error.message)) : d.result); pending.delete(d.id) }
  else if (d.method === 'Tracing.dataCollected') trace.push(...d.params.value)
  else if (d.method === 'Tracing.tracingComplete') traceDone()
}
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })) })
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value
const mouse = (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra })

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
await send('Browser.grantPermissions', { origin: BASE, permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] })

async function measure(id, rate) {
  const t = { do: 'click', sel: '[data-m]', ...TRIGGERS[id] }
  await mouse('mouseMoved', 1, 1)
  await send('Page.navigate', { url: `${BASE}/animations` })
  for (let i = 0; i < 100 && !(await evaluate(`!!document.querySelector('[data-anim]')`)); i++) await sleep(100)
  await sleep(400)
  // Finish mount-time animations elsewhere on the page, bring the row to the viewport center.
  const box = await evaluate(`(() => {
    for (const a of document.getAnimations()) { if (Number.isFinite(a.effect?.getComputedTiming().endTime)) a.finish() }
    const row = document.querySelector('[data-anim="${id}"]') ?? document.querySelector('[data-anim]')
    row.scrollIntoView({ block: 'center' })
    const r = row.querySelector(${JSON.stringify(t.sel)})?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 }
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })()`)
  if (t.do === 'tab') await evaluate(`document.querySelector('[data-anim="${id}"] [data-m]').focus()`)
  await sleep(400)

  await send('Emulation.setCPUThrottlingRate', { rate })
  trace.length = 0
  await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { includedCategories: [
    'devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.animations', 'cc', '__metadata',
  ] } })
  await evaluate(`window.__fr = []; (function f(t) { __fr.push(t); if (__fr.length < 600) requestAnimationFrame(f) })(performance.now()); 0`)
  await sleep(250)
  const t0 = await evaluate(`console.timeStamp('measure-start'); performance.now()`)
  const { x, y } = box
  if (t.do === 'click') { await mouse('mouseMoved', x, y); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y) }
  else if (t.do === 'press') { await mouse('mouseMoved', x, y); await mouse('mousePressed', x, y); await sleep(150); await mouse('mouseReleased', x, y) }
  else if (t.do === 'hover') await mouse('mouseMoved', x, y)
  else if (t.do === 'wheel') await mouse('mouseWheel', x, y, { deltaX: 0, deltaY: 60 })
  else if (t.do === 'tab') {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 })
  }
  await sleep(t.win + 150)
  const raf = await evaluate('__fr')
  const done = new Promise((r) => { traceDone = r })
  await send('Tracing.end')
  await done
  await send('Emulation.setCPUThrottlingRate', { rate: 1 })

  // Frames: rAF timestamps inside [t0, t0 + win].
  const fr = raf.filter((v) => v >= t0 && v <= t0 + t.win)
  const gaps = fr.slice(1).map((v, i) => v - fr[i])
  const worstGap = Math.max(gaps.length ? Math.max(...gaps) : t.win, (fr[0] ?? t0 + t.win) - t0)
  const dropped = gaps.reduce((n, g) => n + Math.max(0, Math.round(g / FRAME) - 1), 0)

  // Trace: renderer main / compositor threads of the page process, same window.
  const mark = trace.find((e) => e.name === 'TimeStamp' && e.args?.data?.message === 'measure-start')
  const T0 = mark.ts
  const T1 = T0 + t.win * 1000
  const names = trace.filter((e) => e.ph === 'M' && e.name === 'thread_name' && e.pid === mark.pid)
  const tid = (n) => names.find((e) => e.args.name === n)?.tid
  const mainTid = mark.tid
  const compTid = tid('Compositor')
  const inWin = (e) => e.pid === mark.pid && e.ts >= T0 && e.ts <= T1
  const busy = (threadId) => trace.filter((e) => inWin(e) && e.tid === threadId && e.ph === 'X' && (e.name === 'RunTask' || e.name === 'ThreadControllerImpl::RunTask'))
    .reduce((s, e) => s + Math.min(e.dur ?? 0, T1 - e.ts), 0) / 1000
  const count = (name) => trace.filter((e) => inWin(e) && e.name === name && (e.ph === 'X' || e.ph === 'B' || e.ph === 'I')).length
  // Compositor check: the row's own animations started in the window; a failure is reported in a later 'n' event.
  const started = trace.filter((e) => inWin(e) && e.name === 'Animation' && e.ph === 'b' && t.anim?.test(`${e.args.data.displayName} ${e.args.data.nodeName}`))
  const same = (b, e) => e.name === 'Animation' && e.id2?.local === b.id2?.local && e.ts >= b.ts // local ids are reused after 'e'
  const fails = started.map((b) => {
    const end = trace.find((e) => same(b, e) && e.ph === 'e')?.ts ?? Infinity
    return trace.find((e) => same(b, e) && e.ph === 'n' && e.ts <= end && e.args?.data?.compositeFailed)
  })
  const unsupported = [...new Set(fails.flatMap((e) => e?.args.data.unsupportedProperties ?? []))].join(', ')
  const nFailed = fails.filter(Boolean).length
  const composited = !t.anim ? 'n/a' : !started.length ? 'not seen' : !nFailed ? 'yes' : `${nFailed === started.length ? 'no' : 'partly'} (${unsupported || 'reason ' + fails.find(Boolean).args.data.compositeFailed})`

  return { frames: fr.length, dropped, worstGap: round(worstGap), mainMs: round(busy(mainTid)), compMs: round(busy(compTid)), layout: count('Layout'), paint: count('Paint'), composited }
}

const results = ONLY ? JSON.parse(readFileSync(OUT, 'utf8')).results : {}
for (const id of Object.keys(TRIGGERS)) {
  if (ONLY && !ONLY.includes(id)) continue
  results[id] = {}
  for (const rate of RATES) {
    const runs = []
    for (let r = 0; r < RUNS; r++) runs.push(await measure(id, rate))
    const med = {}
    for (const k of ['frames', 'dropped', 'worstGap', 'mainMs', 'compMs', 'layout', 'paint']) med[k] = median(runs.map((x) => x[k]))
    med.composited = runs[0].composited
    results[id][rate] = med
    process.stdout.write(`${id.padEnd(16)} ${rate}x ${JSON.stringify(med)}\n`)
  }
}

writeFileSync(OUT, JSON.stringify({
  date: new Date().toISOString().slice(0, 10), chrome: chromeVersion, rates: RATES, runs: RUNS, viewport: VIEWPORT.join('×'), results,
}, null, 2) + '\n')
process.stdout.write(`wrote ${OUT}\n`)
ws.close()
chrome.kill()
server.close()
await sleep(300)
rmSync(profile, { recursive: true, force: true })
process.exit(0)
