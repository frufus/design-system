// Writes one .dc.html artboard per candidate typeface. The palette, the layout
// and every word are identical across the four; only the font stack changes, so
// the board answers exactly one question and no other.
//
//   node tools/make-typefaces.mjs
//
// Three candidates load from the font host the canvas runtime allows. DejaVu is
// not published there, so it is embedded as a subset woff2 data URI from
// tools/fixtures/ - which is also the subsetting path the package itself will
// use once a face is chosen.

import { readFileSync, writeFileSync } from 'node:fs'
import { build } from './palette-report.mjs'

const t = build('petrol').tokens
const L = t.light
const D = t.dark

const b64 = (name) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url)).toString('base64')

const CANDIDATES = [
  {
    file: 'TypefacePlex',
    name: 'IBM Plex',
    sans: 'IBM Plex Sans',
    mono: 'IBM Plex Mono',
    foundry: 'IBM, 2017',
    licence: 'SIL OFL 1.1',
    pkg: '@ibm/plex 6.4.1',
    googleFamilies: 'IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600',
    claim: 'The face the canvas was approved in.',
    cost:
      'No redraw and no risk. Widest weight range of the four, true italics, and a ' +
      'monospace designed as a sibling rather than borrowed. Sourced from IBM directly, ' +
      'so Google appears nowhere in the chain.',
  },
  {
    file: 'TypefaceAtkinson',
    name: 'Atkinson Hyperlegible',
    sans: 'Atkinson Hyperlegible Next',
    mono: 'Atkinson Hyperlegible Mono',
    foundry: 'Braille Institute',
    licence: 'SIL OFL 1.1',
    pkg: '@fontsource/atkinson-hyperlegible-next 5.3.0',
    googleFamilies:
      'Atkinson+Hyperlegible+Next:wght@300;400;500;600;700&family=Atkinson+Hyperlegible+Mono:wght@400;500;600',
    claim: 'Drawn so letters cannot be confused for one another.',
    cost:
      'The only candidate this project can make its own argument for: its ' +
      'non-negotiables are accessibility floors, and this face was built for low ' +
      'vision - I against l against 1, O against 0. Price: wider and more open, so a ' +
      'dense row holds less, and the character is unmistakably its own.',
  },
  {
    file: 'TypefaceFira',
    name: 'Fira',
    sans: 'Fira Sans',
    mono: 'Fira Mono',
    foundry: 'Mozilla, 2013',
    licence: 'SIL OFL 1.1',
    pkg: '@fontsource/fira-sans 5.3.0',
    googleFamilies: 'Fira+Sans:wght@300;400;500;600;700&family=Fira+Mono:wght@400;500;700',
    claim: 'Independent of IBM and of Google alike.',
    cost:
      'Built for Firefox OS, so it is a system typeface by intent - technical, but ' +
      'warmer and rounder than Plex. Price: the mono ships fewer weights, and the ' +
      'softer shapes read slightly less exact in a long column of figures.',
  },
  {
    file: 'TypefaceDejaVu',
    name: 'DejaVu',
    sans: 'DejaVu Sans',
    mono: 'DejaVu Sans Mono',
    foundry: 'Community, from Bitstream Vera',
    licence: 'Bitstream Vera - see note',
    pkg: '@fontsource/dejavu-sans 5.3.0',
    googleFamilies: null,
    embed: [
      { family: 'DejaVu Sans', weight: 400, file: 'dj-sans-400.woff2' },
      { family: 'DejaVu Sans', weight: 700, file: 'dj-sans-700.woff2' },
      { family: 'DejaVu Sans Mono', weight: 400, file: 'dj-mono-400.woff2' },
    ],
    claim: 'The most permissive licence here - on paper.',
    cost:
      'Broad, utilitarian shapes and only two real weights, so 500 and 600 are ' +
      'synthesised above. And the paperwork is the weak point, not the strength: the ' +
      'npm package declares OFL 1.1 while the project upstream ships the Bitstream Vera ' +
      'licence. The option picked for licence clarity has the least clear provenance.',
  },
]

function fontFaces(c) {
  if (!c.embed) return ''
  return c.embed
    .map(
      (f) => `
    @font-face {
      font-family: '${f.family}';
      font-style: normal;
      font-weight: ${f.weight};
      font-display: swap;
      src: url(data:font/woff2;base64,${b64(f.file)}) format('woff2');
    }`,
    )
    .join('')
}

function panel(tk, compact) {
  const rows = compact
    ? [['Status', 'Saved', 'OK', tk.success.hex]]
    : [
        ['Brand', 'Citadel', 'BASE', tk.border.hex],
        ['Status', 'Saved', 'OK', tk.success.hex],
        ['Retention', 'Ends in 9 days', 'WARN', tk.warning.hex],
      ]

  return `
      <div style="border: 1px solid ${tk['border-strong'].hex}; background: ${tk.surface.hex}">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; height: 26px; padding: 0 12px; background: ${compact ? tk.canvas.hex : '#131F22'}">
          <div class="key" style="color: ${compact ? tk.ink.hex : '#EFF5F7'}">Workspace / settings</div>
          <div class="key" style="color: ${compact ? tk['accent-ink'].hex : '#CDF1F0'}">12 rev</div>
        </div>
${rows
  .map(
    ([
      k,
      v,
      code,
      bar,
    ]) => `        <div class="drow" style="border-bottom: 1px solid ${tk.border.hex}">
          <div style="height: 18px; background: ${bar}"></div>
          <div class="key" style="color: ${tk['ink-muted'].hex}">${k}</div>
          <div style="font-size: 14px; color: ${tk.ink.hex}">${v}</div>
          <div class="mono" style="color: ${tk['ink-subtle'].hex}">${code}</div>
        </div>`,
  )
  .join('\n')}
        <div class="irow">
          <div style="height: 18px; background: ${tk.border.hex}"></div>
          <div class="key" style="color: ${tk['ink-muted'].hex}">Name</div>
          <div class="ctl" style="background: ${tk['surface-sunken'].hex}; border-color: ${tk['border-strong'].hex}; border-top-color: ${tk['ink-muted'].hex}; color: ${tk.ink.hex}">Studio</div>
          <div class="mono" style="color: ${tk['ink-subtle'].hex}">6/40</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; background: ${tk['surface-sunken'].hex}; border-top: 1px solid ${tk['border-strong'].hex}">
          <div style="display: flex">
            <span class="btn" style="border-radius: 4px 0 0 4px; background: ${tk.accent.hex}; color: ${tk['ink-on-accent'].hex}">Save changes</span>
            <span class="btn" style="border-radius: 0 4px 4px 0; border-color: ${tk['border-strong'].hex}; border-left-width: 0; color: ${tk.ink.hex}">Discard</span>
          </div>
          <div class="mono" style="color: ${tk['ink-subtle'].hex}">v0.1.0</div>
        </div>
      </div>`
}

function artboard(c) {
  const sansStack = `'${c.sans}', ui-sans-serif, system-ui, 'Segoe UI', sans-serif`
  const monoStack = `'${c.mono}', ui-monospace, Consolas, monospace`
  const link = c.googleFamilies
    ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${c.googleFamilies}&display=swap">`
    : ''

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  ${link}
  <style>${fontFaces(c)}
    body { margin: 0; font-family: ${sansStack}; -webkit-font-smoothing: antialiased; font-variant-numeric: tabular-nums; }
    a { color: ${L['accent-ink'].hex}; text-decoration: underline; text-underline-offset: 3px; }
    a:hover { color: ${L.accent.hex}; }
    .mono { font-family: ${monoStack}; font-size: 11px; }
    .key { font-family: ${monoStack}; font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; }
    .drow { display: grid; grid-template-columns: 3px 92px minmax(0, 1fr) auto; align-items: center; gap: 0 10px; height: 40px; padding: 0 12px; }
    .irow { display: grid; grid-template-columns: 3px 92px minmax(0, 1fr) auto; align-items: center; gap: 0 10px; height: 52px; padding: 0 12px; }
    .ctl { display: flex; align-items: center; height: 44px; padding: 0 12px; border-radius: 4px; border: 1px solid transparent; box-sizing: border-box; font-size: 15px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 14px; border-radius: 4px; font-size: 13px; font-weight: 600; letter-spacing: 0.02em; border: 1px solid transparent; box-sizing: border-box; }
  </style>
</helmet>

<div style="display: flex; flex-direction: column; gap: 16px; padding: 24px; background: ${L['surface-sunken'].hex}; min-height: 100%; box-sizing: border-box">

  <div style="display: flex; flex-direction: column; gap: 6px">
    <div style="font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: ${L.ink.hex}">${c.name}</div>
    <div class="key" style="color: ${L['ink-subtle'].hex}">${c.foundry} &middot; ${c.licence}</div>
    <div style="font-size: 14px; line-height: 1.5; color: ${L['ink-muted'].hex}">${c.claim}</div>
  </div>

  <div style="border: 1px solid ${L['border-strong'].hex}; background: ${L.surface.hex}; padding: 16px 18px">
    <div style="display: flex; align-items: flex-end; gap: 16px">
      <div style="font-size: 56px; font-weight: 300; line-height: 1; letter-spacing: -0.03em; color: ${L.ink.hex}">Aa</div>
      <div class="mono" style="font-size: 34px; line-height: 1.1; color: ${L.ink.hex}">Il1O0</div>
    </div>
    <div style="display: flex; gap: 14px; align-items: baseline; padding-top: 14px">
      <span style="font-size: 19px; font-weight: 300; color: ${L['ink-muted'].hex}">300</span>
      <span style="font-size: 19px; font-weight: 400; color: ${L['ink-muted'].hex}">400</span>
      <span style="font-size: 19px; font-weight: 500; color: ${L.ink.hex}">500</span>
      <span style="font-size: 19px; font-weight: 600; color: ${L.ink.hex}">600</span>
      <span style="font-size: 19px; font-weight: 700; color: ${L.ink.hex}">700</span>
    </div>
    <div class="mono" style="font-size: 14px; color: ${L['ink-muted'].hex}; padding-top: 10px">0123456789 &middot; 16.90 / 3.82</div>
    <div style="font-size: 15px; line-height: 22px; color: ${L['ink-muted'].hex}; padding-top: 12px; text-wrap: pretty">
      A dense row has to stay readable at fifteen over twenty-two, and a column of
      figures has to stay a column when the figures change.
    </div>
  </div>
${panel(L, false)}
${panel(D, true)}

  <div style="display: flex; gap: 10px; align-items: flex-start; padding: 14px 16px; background: ${L.surface.hex}; border-left: 3px solid ${L.accent.hex}">
    <div style="font-size: 12px; line-height: 1.6; color: ${L['ink-muted'].hex}; text-wrap: pretty">${c.cost}</div>
  </div>

  <div class="key" style="color: ${L['ink-subtle'].hex}">${c.pkg}</div>

</div>
</x-dc>
</body>
</html>
`
}

for (const c of CANDIDATES) {
  const path = new URL(`../docs/design/${c.file}.dc.html`, import.meta.url)
  writeFileSync(path, artboard(c), 'utf8')
  console.log(`wrote docs/design/${c.file}.dc.html`)
}
console.log(`${CANDIDATES.length} typeface artboards written.`)
