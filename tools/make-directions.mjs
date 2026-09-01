// Writes one .dc.html artboard per candidate direction, straight from the
// measured token values in palette-report.mjs. Hand-copying hex into artboards
// is how a canvas starts lying about what it tested, so nothing here is typed
// twice: the swatches, the controls and the printed ratios all come from the
// same build.
//
//   node tools/make-directions.mjs
//
// A direction is more than a hue. Each carries its own form and type stance
// below, because "too boring" is rarely only a colour problem.

import { writeFileSync } from 'node:fs'
import { build, measure, directions } from './palette-report.mjs'

const FORM = {
  indigo: {
    file: 'DirectionIndigo',
    tagline: 'Soft modern - the incumbent',
    font: 'Manrope',
    weights: '400;500;600;700',
    ctlRadius: 12,
    cardRadius: 16,
    pill: false,
    ctlHeight: 44,
    borderW: 1,
    shadow: true,
    tracking: '-0.005em',
    caps: false,
    formNote: 'Generous radii, one hairline border, a soft shadow at rest.',
  },
  petrol: {
    file: 'DirectionPetrol',
    tagline: 'Instrument - tight, flat, technical',
    font: 'IBM Plex Sans',
    weights: '400;500;600;700',
    ctlRadius: 8,
    cardRadius: 10,
    pill: false,
    ctlHeight: 44,
    borderW: 1,
    shadow: false,
    tracking: '0',
    caps: true,
    formNote: 'Tighter radii, no shadow anywhere, labels in small caps. Depth comes from tone.',
  },
  amethyst: {
    file: 'DirectionAmethyst',
    tagline: 'Warm ground, cool accent',
    font: 'Instrument Sans',
    weights: '400;500;600;700',
    ctlRadius: 14,
    cardRadius: 20,
    pill: false,
    ctlHeight: 48,
    borderW: 1,
    shadow: true,
    tracking: '-0.01em',
    caps: false,
    formNote: 'Roomier controls, larger radii, a warm shadow. The most relaxed of the five.',
  },
  magenta: {
    file: 'DirectionMagenta',
    tagline: 'One loud colour, everything else quiet',
    font: 'Space Grotesk',
    weights: '400;500;600;700',
    ctlRadius: 12,
    cardRadius: 18,
    pill: true,
    ctlHeight: 44,
    borderW: 1,
    shadow: true,
    tracking: '-0.015em',
    caps: false,
    formNote: 'Pill-shaped actions against square-ish cards, so the button is the loudest shape too.',
  },
  signal: {
    file: 'DirectionSignal',
    tagline: 'Colour is rationed',
    font: 'Archivo',
    weights: '400;500;600;700',
    ctlRadius: 6,
    cardRadius: 8,
    pill: false,
    ctlHeight: 44,
    borderW: 1.5,
    shadow: false,
    tracking: '-0.01em',
    caps: true,
    formNote: 'Crisp corners, a heavier border, no shadow. Ink carries the hierarchy; the accent only fills the one action that matters.',
  },
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function swatch(label, hex, ringHex) {
  return `
            <div style="display: flex; flex-direction: column; gap: 5px">
              <div style="height: 34px; border-radius: 8px; background: ${hex}; border: 1px solid ${ringHex}"></div>
              <div class="micro" style="color: ${ringHex === hex ? hex : 'inherit'}">${label}</div>
            </div>`
}

// One appearance of one direction: swatches, then a composition that exercises
// the tokens a viewer actually judges - a card, a field, three button roles.
function panel(t, form, appearance, rows) {
  const btnRadius = form.pill ? 999 : form.ctlRadius
  const capStyle = form.caps
    ? 'text-transform: uppercase; letter-spacing: 0.06em; font-size: 12px;'
    : `letter-spacing: ${form.tracking};`
  const shadow = form.shadow
    ? appearance === 'light'
      ? 'box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 6px 18px rgba(0, 0, 0, 0.05);'
      : ''
    : ''
  const tightest = rows
    .slice()
    .sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0]

  return `
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: ${form.cardRadius + 4}px; background: ${t.canvas.hex}; border: ${form.borderW}px solid ${t.border.hex}">

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px">
          <div class="micro" style="color: ${t['ink-subtle'].hex}">${appearance === 'light' ? 'LIGHT' : 'DARK'}</div>
          <div class="micro" style="color: ${t['ink-subtle'].hex}">${rows.filter((r) => r.ok).length}/${rows.length} pairs pass</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; color: ${t['ink-muted'].hex}">${[
          ['surface', t.surface.hex],
          ['border+', t['border-strong'].hex],
          ['ink', t.ink.hex],
          ['accent', t.accent.hex],
          ['soft', t['accent-soft'].hex],
          ['danger', t.danger.hex],
        ]
          .map(([label, hex]) => swatch(label, hex, t.border.hex))
          .join('')}
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; padding: 18px; border-radius: ${form.cardRadius}px; background: ${t.surface.hex}; border: ${form.borderW}px solid ${t.border.hex}; ${shadow}">

          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px">
            <div style="font-size: 20px; font-weight: 600; letter-spacing: ${form.tracking}; color: ${t.ink.hex}">Workspace</div>
            <span style="display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px; border-radius: 999px; font-size: 11px; font-weight: 600; background: ${t['success-soft'].hex}; color: ${t['success-ink'].hex}">
              <span style="width: 5px; height: 5px; border-radius: 999px; background: ${t['success-ink'].hex}"></span>Saved</span>
          </div>

          <div style="font-size: 14px; line-height: 21px; color: ${t['ink-muted'].hex}; text-wrap: pretty">
            Everyone you invite sees this name. <a href="#" style="color: ${t['accent-ink'].hex}">What others see</a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px">
            <div class="label" style="color: ${t.ink.hex}; ${capStyle}">Name</div>
            <div style="display: flex; align-items: center; height: ${form.ctlHeight}px; padding: 0 13px; border-radius: ${form.ctlRadius}px; font-size: 15px; background: ${t.surface.hex}; border: ${form.borderW}px solid ${t['border-strong'].hex}; color: ${t.ink.hex}; box-sizing: border-box">Studio</div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 5px">
            <div class="label" style="color: ${t.ink.hex}; ${capStyle}">Appearance</div>
            <div style="display: flex; align-items: center; justify-content: space-between; height: ${form.ctlHeight}px; padding: 0 13px; border-radius: ${form.ctlRadius}px; font-size: 15px; background: ${t.surface.hex}; border: ${form.borderW}px solid ${t.focus.hex}; color: ${t.ink.hex}; box-sizing: border-box; box-shadow: 0 0 0 2px ${t.surface.hex}, 0 0 0 4px ${t.focus.hex}">
              <span>Follow the system</span>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M6 8.5 10 12.5l4-4" stroke="${t['ink-muted'].hex}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 8px; padding-top: 12px; border-top: ${form.borderW}px solid ${t.border.hex}">
            <span class="btn" style="height: ${form.ctlHeight}px; border-radius: ${btnRadius}px; background: ${t.accent.hex}; color: ${t['ink-on-accent'].hex}; ${capStyle}">Save changes</span>
            <span class="btn" style="height: ${form.ctlHeight}px; border-radius: ${btnRadius}px; color: ${t['accent-ink'].hex}; ${capStyle}">Discard</span>
            <span class="btn" style="height: ${form.ctlHeight}px; border-radius: ${btnRadius}px; background: ${t.danger.hex}; color: ${t['ink-on-danger'].hex}; ${capStyle}">Delete</span>
          </div>
        </div>

        <div class="micro" style="color: ${t['ink-subtle'].hex}">
          tightest ${tightest.fg} on ${tightest.bg} &middot; ${tightest.ratio.toFixed(2)}:1 (min ${tightest.min})
        </div>
      </div>`
}

function artboard(key) {
  const form = FORM[key]
  const built = build(key)
  const results = measure(built)
  const light = built.tokens.light
  const dark = built.tokens.dark
  const fontFamily = `'${form.font}', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`
  const href = `https://fonts.googleapis.com/css2?family=${form.font.replace(/ /g, '+')}:wght@${form.weights}&display=swap`

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="${href}">
  <style>
    body { margin: 0; font-family: ${fontFamily}; -webkit-font-smoothing: antialiased; }
    a { color: ${light['accent-ink'].hex}; text-decoration: underline; text-underline-offset: 2px; }
    a:hover { color: ${light.accent.hex}; }
    .micro { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
    .label { font-size: 13px; font-weight: 600; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0 16px; font-size: 14px; font-weight: 600;
      border: 1px solid transparent; box-sizing: border-box; white-space: nowrap;
    }
  </style>
</helmet>

<div style="display: flex; flex-direction: column; gap: 16px; padding: 26px; background: ${light['surface-sunken'].hex}; min-height: 100%; box-sizing: border-box">

  <div style="display: flex; flex-direction: column; gap: 7px">
    <div style="display: flex; align-items: baseline; gap: 10px">
      <div style="font-size: 26px; font-weight: 700; letter-spacing: -0.02em; color: ${light.ink.hex}">${esc(built.label)}</div>
      <div class="micro" style="color: ${light['ink-subtle'].hex}">${esc(form.tagline)}</div>
    </div>
    <div style="font-size: 13px; line-height: 1.55; color: ${light['ink-muted'].hex}; text-wrap: pretty">${esc(built.note)}</div>
    <div style="font-size: 13px; line-height: 1.55; color: ${light['ink-muted'].hex}; text-wrap: pretty"><strong style="color: ${light.ink.hex}">Form.</strong> ${esc(form.formNote)} Type is ${esc(form.font)}.</div>
  </div>
${panel(light, form, 'light', results.light)}
${panel(dark, form, 'dark', results.dark)}

</div>
</x-dc>
</body>
</html>
`
}

let count = 0
for (const key of Object.keys(directions)) {
  const form = FORM[key]
  if (!form) throw new Error(`no form stance defined for direction ${key}`)
  const path = new URL(`../docs/design/${form.file}.dc.html`, import.meta.url)
  writeFileSync(path, artboard(key), 'utf8')
  count++
  console.log(`wrote docs/design/${form.file}.dc.html`)
}
console.log(`${count} direction artboards written from measured token values.`)
