// Resolves a candidate OKLCH palette to sRGB and measures every contrast pair
// the design canvas claims. The canvas is the binding handoff for tokens.css,
// so its numbers have to be computed rather than eyeballed.
//
//   node tools/palette-report.mjs                 # every direction, full report
//   node tools/palette-report.mjs petrol          # one direction
//   node tools/palette-report.mjs petrol --hex    # name -> hex, for authoring
//
// A direction changes hue, chroma and - where the identity demands it - which
// ramp step a semantic token points at. The lightness ladders below are shared,
// because they are what the accessibility floors were tuned against.

import { pathToFileURL } from 'node:url'

// [lightness, base chroma] per step. Chroma is scaled per direction and then
// clamped into sRGB, so a direction can push saturation without inventing
// colours the browser cannot paint.
const LADDER = {
  neutral: {
    n0: [1.0, 0],
    n50: [0.985, 0.004],
    n100: [0.966, 0.006],
    n200: [0.906, 0.009],
    n300: [0.879, 0.011],
    n400: [0.742, 0.015],
    n500: [0.606, 0.017],
    n600: [0.502, 0.019],
    n700: [0.408, 0.019],
    n800: [0.302, 0.017],
    n900: [0.228, 0.015],
    n950: [0.171, 0.013],
    n1000: [0.132, 0.011],
  },
  accent: {
    a100: [0.932, 0.032],
    a300: [0.762, 0.118],
    a400: [0.668, 0.163],
    a450: [0.618, 0.168],
    a500: [0.568, 0.17],
    a600: [0.518, 0.166],
    a700: [0.455, 0.148],
    a800: [0.4, 0.128],
    a950: [0.242, 0.076],
  },
  success: {
    s100: [0.938, 0.038],
    s400: [0.7, 0.132],
    s500: [0.578, 0.126],
    s600: [0.5, 0.112],
    s950: [0.248, 0.062],
  },
  warning: {
    w100: [0.952, 0.036],
    w400: [0.792, 0.148],
    w500: [0.702, 0.148],
    w600: [0.588, 0.12],
    w700: [0.47, 0.098],
    w950: [0.268, 0.055],
  },
  danger: {
    d100: [0.94, 0.028],
    d300: [0.762, 0.128],
    d400: [0.678, 0.176],
    d450: [0.628, 0.18],
    d500: [0.582, 0.192],
    d600: [0.512, 0.18],
    d700: [0.445, 0.16],
    d800: [0.382, 0.138],
    d950: [0.252, 0.082],
  },
}

const BASE_SEMANTIC = {
  light: {
    canvas: 'n50',
    surface: 'n0',
    'surface-sunken': 'n100',
    'surface-raised': 'n0',
    border: 'n200',
    'border-strong': 'n500',
    ink: 'n900',
    'ink-muted': 'n600',
    'ink-subtle': 'n500',
    'ink-on-accent': 'n0',
    'ink-on-danger': 'n0',
    accent: 'a500',
    'accent-hover': 'a600',
    'accent-active': 'a700',
    'accent-soft': 'a100',
    'accent-ink': 'a700',
    focus: 'a500',
    success: 's600',
    'success-soft': 's100',
    'success-ink': 's600',
    warning: 'w600',
    'warning-soft': 'w100',
    'warning-ink': 'w700',
    danger: 'd600',
    'danger-hover': 'd700',
    'danger-active': 'd800',
    'danger-soft': 'd100',
    'danger-ink': 'd600',
    'disabled-surface': 'n200',
    'disabled-ink': 'n600',
  },
  dark: {
    canvas: 'n1000',
    surface: 'n950',
    'surface-sunken': 'n1000',
    'surface-raised': 'n900',
    border: 'n800',
    'border-strong': 'n600',
    ink: 'n100',
    'ink-muted': 'n400',
    'ink-subtle': 'n500',
    'ink-on-accent': 'n1000',
    'ink-on-danger': 'n1000',
    accent: 'a400',
    'accent-hover': 'a300',
    'accent-active': 'a450',
    'accent-soft': 'a950',
    'accent-ink': 'a300',
    focus: 'a400',
    success: 's400',
    'success-soft': 's950',
    'success-ink': 's400',
    warning: 'w400',
    'warning-soft': 'w950',
    'warning-ink': 'w400',
    danger: 'd400',
    'danger-hover': 'd300',
    'danger-active': 'd450',
    'danger-soft': 'd950',
    'danger-ink': 'd400',
    'disabled-surface': 'n800',
    'disabled-ink': 'n500',
  },
}

// Hue slots 152 (success), 75 (warning) and 25 (danger) are spoken for, so an
// accent landing next to one of them has to earn its place another way. Each
// direction below either stays clear of them or says how it separates.
export const directions = {
  indigo: {
    label: 'Indigo',
    note: 'The incumbent. Cool neutrals, a mid-chroma blue-violet accent.',
    hues: { neutral: 268, accent: 268, success: 152, warning: 75, danger: 25 },
    chroma: { neutral: 1, accent: 1 },
  },

  petrol: {
    label: 'Petrol',
    note: 'Cool neutrals pulled toward the accent; a deep blue-green that reads as instrument rather than app.',
    hues: { neutral: 214, accent: 196, success: 148, warning: 75, danger: 25 },
    chroma: { neutral: 1.2, accent: 1.15 },
    overrides: {
      light: { accent: 'a600', 'accent-hover': 'a700', 'accent-active': 'a800' },
    },
  },

  amethyst: {
    label: 'Amethyst',
    note: 'Warm greige neutrals under a violet accent. The tension between a warm ground and a cool accent is the identity.',
    hues: { neutral: 64, accent: 305, success: 152, warning: 70, danger: 25 },
    chroma: { neutral: 1.6, accent: 1.1 },
  },

  magenta: {
    label: 'Magenta',
    note: 'Near-neutral greys carrying a single high-chroma pink. Loud on purpose, and the furthest thing from a default.',
    hues: { neutral: 312, accent: 342, success: 152, warning: 75, danger: 18 },
    chroma: { neutral: 0.8, accent: 1.2 },
  },

  signal: {
    label: 'Signal',
    note: 'Colour is rationed. Warm graphite does the work and one hot accent appears only as a fill on the single primary action. Links and the focus ring are ink. The destructive action stays distinct from the warm accent by inverting: dark ink on the accent, light ink on a deeper red.',
    hues: { neutral: 70, accent: 45, success: 152, warning: 75, danger: 12 },
    chroma: { neutral: 1.5, accent: 1.35 },
    overrides: {
      light: {
        accent: 'a400',
        'accent-hover': 'a300',
        'accent-active': 'a450',
        'ink-on-accent': 'n1000',
        'accent-ink': 'n900',
        focus: 'n900',
      },
      dark: {
        'accent-ink': 'n100',
        focus: 'n100',
      },
    },
  },
}

// Every pair the canvas asserts. `min` is the floor from the project's
// non-negotiables: 4.5 for text, 3 for non-text (borders, focus rings, icons).
export const PAIRS = [
  ['ink', 'canvas', 4.5, 'body text on the page ground'],
  ['ink', 'surface', 4.5, 'body text on a card'],
  ['ink', 'surface-sunken', 4.5, 'body text on a sunken area'],
  ['ink-muted', 'surface', 4.5, 'secondary text on a card'],
  ['ink-muted', 'canvas', 4.5, 'secondary text on the ground'],
  ['ink-subtle', 'surface', 3, 'placeholder and disabled text'],
  ['ink-on-accent', 'accent', 4.5, 'label on a primary button'],
  ['ink-on-accent', 'accent-hover', 4.5, 'label on a hovered primary button'],
  ['ink-on-accent', 'accent-active', 4.5, 'label on a pressed primary button'],
  ['accent-ink', 'surface', 4.5, 'link and ghost-button text'],
  ['accent-ink', 'accent-soft', 4.5, 'text on a soft accent fill'],
  ['focus', 'surface', 3, 'focus ring against a card'],
  ['focus', 'canvas', 3, 'focus ring against the ground'],
  ['border', 'surface', 1.3, 'card border (decorative separation only)'],
  ['border-strong', 'surface', 3, 'input border - non-text contrast floor'],
  ['border-strong', 'canvas', 3, 'input border on the ground'],
  ['success-ink', 'success-soft', 4.5, 'success badge text'],
  ['warning-ink', 'warning-soft', 4.5, 'warning badge text'],
  ['danger-ink', 'danger-soft', 4.5, 'danger badge text'],
  ['danger-ink', 'surface', 4.5, 'field error message'],
  ['danger', 'surface', 3, 'error border on a field'],
  ['ink-on-danger', 'danger', 4.5, 'label on a destructive button'],
  ['ink-on-danger', 'danger-hover', 4.5, 'label on a hovered destructive button'],
  ['ink-on-danger', 'danger-active', 4.5, 'label on a pressed destructive button'],
  ['disabled-ink', 'disabled-surface', 3, 'label on a disabled control'],
  ['success', 'surface', 3, 'success indicator'],
  ['warning', 'surface', 3, 'warning indicator'],
]

function oklchToLinearSrgb([L, C, hDeg]) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

const encode = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const clamp = (c) => Math.min(1, Math.max(0, c))

export function resolve(oklch) {
  const linear = oklchToLinearSrgb(oklch)
  const inGamut = linear.every((c) => c >= -0.0005 && c <= 1.0005)
  const clamped = linear.map(clamp)
  const rgb = clamped.map((c) => Math.round(clamp(encode(c)) * 255))
  const hex =
    '#' +
    rgb
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  const luminance = 0.2126 * clamped[0] + 0.7152 * clamped[1] + 0.0722 * clamped[2]
  return { hex, luminance, inGamut }
}

export function contrast(a, b) {
  const [hi, lo] = a.luminance >= b.luminance ? [a, b] : [b, a]
  return (hi.luminance + 0.05) / (lo.luminance + 0.05)
}

// Largest chroma that still fits in sRGB at this lightness and hue, to 0.001.
function maxChroma(L, h) {
  let lo = 0
  let hi = 0.4
  while (hi - lo > 0.0005) {
    const mid = (lo + hi) / 2
    if (resolve([L, mid, h]).inGamut) lo = mid
    else hi = mid
  }
  return Math.floor(lo * 1000) / 1000
}

// Builds every ramp for one direction, clamping chroma into sRGB rather than
// letting the browser clip it silently.
export function build(key) {
  const dir = directions[key]
  if (!dir) throw new Error(`unknown direction ${key}`)

  const ramps = {}
  const clamped = []

  for (const [family, steps] of Object.entries(LADDER)) {
    const hue = dir.hues[family] ?? dir.hues.accent
    const scale = dir.chroma[family] ?? dir.chroma.accent ?? 1
    for (const [name, [L, baseC]] of Object.entries(steps)) {
      const wanted = baseC * scale
      const C = Math.min(wanted, maxChroma(L, hue))
      if (wanted - C > 0.0005) clamped.push(`${name} ${wanted.toFixed(3)}->${C.toFixed(3)}`)
      ramps[name] = { oklch: [L, Number(C.toFixed(3)), hue], ...resolve([L, C, hue]) }
    }
  }

  const tokens = {}
  for (const appearance of ['light', 'dark']) {
    const map = { ...BASE_SEMANTIC[appearance], ...(dir.overrides?.[appearance] ?? {}) }
    tokens[appearance] = Object.fromEntries(
      Object.entries(map).map(([token, step]) => {
        const value = ramps[step]
        if (!value) throw new Error(`${key}/${appearance}/${token} points at unknown step ${step}`)
        return [token, { ...value, step }]
      }),
    )
  }

  return { key, label: dir.label, note: dir.note, ramps, tokens, clamped }
}

export function measure(built) {
  const results = {}
  for (const appearance of ['light', 'dark']) {
    const t = built.tokens[appearance]
    results[appearance] = PAIRS.map(([fg, bg, min, what]) => {
      const ratio = contrast(t[fg], t[bg])
      return { fg, bg, min, what, ratio, ok: ratio >= min }
    })
  }
  return results
}

const fmtOklch = ([L, C, h]) => `oklch(${L} ${C} ${h})`

// Report only when run directly - other tools import build() and measure(),
// and an import that printed a report and then exited would take them with it.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
const args = process.argv.slice(2)
const named = args.filter((a) => !a.startsWith('--'))
const keys = named.length ? named : Object.keys(directions)

if (args.includes('--hex')) {
  for (const key of keys) {
    const built = build(key)
    for (const appearance of ['light', 'dark']) {
      console.log(`\n# ${key} / ${appearance}`)
      for (const [token, v] of Object.entries(built.tokens[appearance])) {
        console.log(`${token.padEnd(16)} ${v.hex}  ${fmtOklch(v.oklch)}`)
      }
    }
  }
  process.exit(0)
}

let failures = 0
for (const key of keys) {
  const built = build(key)
  const results = measure(built)
  failures += [...results.light, ...results.dark].filter((r) => !r.ok).length

  console.log(`\n${'='.repeat(66)}\n${built.label}  (${key})\n${built.note}`)
  if (built.clamped.length) console.log(`chroma clamped into sRGB: ${built.clamped.join(', ')}`)

  for (const appearance of ['light', 'dark']) {
    const rows = results[appearance]
    const tightest = [...rows].sort((a, b) => a.ratio / a.min - b.ratio / b.min)[0]
    console.log(
      `  ${appearance.padEnd(5)} ${rows.filter((r) => r.ok).length}/${rows.length} pass` +
        `   tightest: ${tightest.fg} on ${tightest.bg} ` +
        `${tightest.ratio.toFixed(2)} (min ${tightest.min})`,
    )
    for (const r of rows.filter((x) => !x.ok)) {
      console.log(
        `    FAIL ${r.ratio.toFixed(2)} : 1 (min ${r.min})  ${r.fg} on ${r.bg} - ${r.what}`,
      )
    }
  }
}

console.log(
  failures === 0
    ? `\nAll ${keys.length * PAIRS.length * 2} pairs meet their floor across ${keys.length} direction(s).`
    : `\n${failures} problem(s).`,
)
process.exit(failures === 0 ? 0 : 1)
}
