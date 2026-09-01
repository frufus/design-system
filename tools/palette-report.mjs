// Resolves the candidate OKLCH palette to sRGB and measures every contrast
// pair the design canvas claims. The canvas is the binding handoff for
// tokens.css, so its numbers have to be computed rather than eyeballed.
//
//   node tools/palette-report.mjs          # full report
//   node tools/palette-report.mjs --hex    # just name -> hex, for authoring

const H_NEUTRAL = 268
const H_ACCENT = 268
const H_SUCCESS = 152
const H_WARNING = 75
const H_DANGER = 25

// Raw ramps. Neutrals carry a trace of the accent hue so surfaces and accent
// read as one material rather than grey with a blue bolted on.
export const ramps = {
  n0: [1.0, 0.0, H_NEUTRAL],
  n50: [0.985, 0.004, H_NEUTRAL],
  n100: [0.966, 0.006, H_NEUTRAL],
  n200: [0.906, 0.009, H_NEUTRAL],
  n300: [0.879, 0.011, H_NEUTRAL],
  n400: [0.742, 0.015, H_NEUTRAL],
  n500: [0.606, 0.017, H_NEUTRAL],
  n600: [0.502, 0.019, H_NEUTRAL],
  n700: [0.408, 0.019, H_NEUTRAL],
  n800: [0.302, 0.017, H_NEUTRAL],
  n900: [0.228, 0.015, H_NEUTRAL],
  n950: [0.171, 0.013, H_NEUTRAL],
  n1000: [0.132, 0.011, H_NEUTRAL],

  a100: [0.932, 0.032, H_ACCENT],
  a300: [0.762, 0.118, H_ACCENT],
  a400: [0.668, 0.163, H_ACCENT],
  a450: [0.618, 0.168, H_ACCENT],
  a500: [0.568, 0.170, H_ACCENT],
  a600: [0.518, 0.166, H_ACCENT],
  a700: [0.455, 0.148, H_ACCENT],
  a900: [0.298, 0.098, H_ACCENT],
  a950: [0.242, 0.076, H_ACCENT],

  s100: [0.938, 0.038, H_SUCCESS],
  s400: [0.700, 0.132, H_SUCCESS],
  s500: [0.578, 0.126, H_SUCCESS],
  s600: [0.500, 0.112, H_SUCCESS],
  s950: [0.248, 0.062, H_SUCCESS],

  w100: [0.952, 0.036, H_WARNING],
  w400: [0.792, 0.148, H_WARNING],
  w500: [0.702, 0.148, H_WARNING],
  w600: [0.588, 0.120, H_WARNING],
  w700: [0.470, 0.098, H_WARNING],
  w950: [0.268, 0.055, H_WARNING],

  d100: [0.940, 0.028, H_DANGER],
  d300: [0.762, 0.128, H_DANGER],
  d400: [0.678, 0.176, H_DANGER],
  d450: [0.628, 0.180, H_DANGER],
  d500: [0.582, 0.192, H_DANGER],
  d600: [0.512, 0.180, H_DANGER],
  d700: [0.445, 0.160, H_DANGER],
  d800: [0.382, 0.138, H_DANGER],
  d950: [0.252, 0.082, H_DANGER],
}

// Semantic tokens per appearance. These names become --fds-* in tokens.css.
export const semantic = {
  light: {
    'canvas': 'n50',
    'surface': 'n0',
    'surface-sunken': 'n100',
    'surface-raised': 'n0',
    'border': 'n200',
    'border-strong': 'n500',
    'ink': 'n900',
    'ink-muted': 'n600',
    'ink-subtle': 'n500',
    'ink-on-accent': 'n0',
    'accent': 'a500',
    'accent-hover': 'a600',
    'accent-active': 'a700',
    'accent-soft': 'a100',
    'accent-ink': 'a700',
    'success': 's600',
    'success-soft': 's100',
    'success-ink': 's600',
    'warning': 'w600',
    'warning-soft': 'w100',
    'warning-ink': 'w700',
    'danger': 'd600',
    'danger-hover': 'd700',
    'danger-active': 'd800',
    'danger-soft': 'd100',
    'danger-ink': 'd600',
    'disabled-surface': 'n200',
    'disabled-ink': 'n600',
  },
  dark: {
    'canvas': 'n1000',
    'surface': 'n950',
    'surface-sunken': 'n1000',
    'surface-raised': 'n900',
    'border': 'n800',
    'border-strong': 'n600',
    'ink': 'n100',
    'ink-muted': 'n400',
    'ink-subtle': 'n500',
    'ink-on-accent': 'n1000',
    'accent': 'a400',
    'accent-hover': 'a300',
    'accent-active': 'a450',
    'accent-soft': 'a950',
    'accent-ink': 'a300',
    'success': 's400',
    'success-soft': 's950',
    'success-ink': 's400',
    'warning': 'w400',
    'warning-soft': 'w950',
    'warning-ink': 'w400',
    'danger': 'd400',
    'danger-hover': 'd300',
    'danger-active': 'd450',
    'danger-soft': 'd950',
    'danger-ink': 'd400',
    'disabled-surface': 'n800',
    'disabled-ink': 'n500',
  },
}

// Every pair the canvas asserts. `min` is the floor from the project's
// non-negotiables: 4.5 for text, 3 for non-text (borders, focus rings, icons).
const pairs = [
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
  ['accent', 'surface', 3, 'focus ring against a card'],
  ['accent', 'canvas', 3, 'focus ring against the ground'],
  ['border', 'surface', 1.3, 'card border (decorative separation only)'],
  ['border-strong', 'surface', 3, 'input border - non-text contrast floor'],
  ['border-strong', 'canvas', 3, 'input border on the ground'],
  ['success-ink', 'success-soft', 4.5, 'success badge text'],
  ['warning-ink', 'warning-soft', 4.5, 'warning badge text'],
  ['danger-ink', 'danger-soft', 4.5, 'danger badge text'],
  ['danger-ink', 'surface', 4.5, 'field error message'],
  ['danger', 'surface', 3, 'error border on a field'],
  ['ink-on-accent', 'danger', 4.5, 'label on a destructive button'],
  ['ink-on-accent', 'danger-hover', 4.5, 'label on a hovered destructive button'],
  ['ink-on-accent', 'danger-active', 4.5, 'label on a pressed destructive button'],
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
  const hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()
  const luminance = 0.2126 * clamped[0] + 0.7152 * clamped[1] + 0.0722 * clamped[2]
  return { hex, luminance, inGamut }
}

export function contrast(a, b) {
  const [hi, lo] = a.luminance >= b.luminance ? [a, b] : [b, a]
  return (hi.luminance + 0.05) / (lo.luminance + 0.05)
}

const resolved = Object.fromEntries(
  Object.entries(ramps).map(([name, oklch]) => [name, { ...resolve(oklch), oklch }]),
)

function tokensFor(appearance) {
  return Object.fromEntries(
    Object.entries(semantic[appearance]).map(([token, ramp]) => {
      const value = resolved[ramp]
      if (!value) throw new Error(`${appearance}/${token} points at unknown ramp ${ramp}`)
      return [token, { ...value, ramp }]
    }),
  )
}

const fmtOklch = ([L, C, h]) => `oklch(${L} ${C} ${h})`

if (process.argv.includes('--hex')) {
  for (const appearance of ['light', 'dark']) {
    console.log(`\n# ${appearance}`)
    for (const [token, v] of Object.entries(tokensFor(appearance))) {
      console.log(`${token.padEnd(16)} ${v.hex}  ${fmtOklch(v.oklch)}`)
    }
  }
  process.exit(0)
}

// Largest chroma that still fits in sRGB at this lightness and hue, to 0.001.
function maxChroma([L, , h]) {
  let lo = 0
  let hi = 0.4
  while (hi - lo > 0.0005) {
    const mid = (lo + hi) / 2
    if (resolve([L, mid, h]).inGamut) lo = mid
    else hi = mid
  }
  return Math.floor(lo * 1000) / 1000
}

let failures = 0
const outOfGamut = Object.entries(resolved).filter(([, v]) => !v.inGamut)
if (outOfGamut.length) {
  failures += outOfGamut.length
  console.log('OUT OF sRGB GAMUT (the browser would clip these):')
  for (const [name, v] of outOfGamut) {
    console.log(`  ${name}  ${fmtOklch(v.oklch)}  -> max chroma here is ${maxChroma(v.oklch)}`)
  }
  console.log()
}

for (const appearance of ['light', 'dark']) {
  const t = tokensFor(appearance)
  console.log(`\n=== ${appearance} ===`)
  for (const [fg, bg, min, what] of pairs) {
    const ratio = contrast(t[fg], t[bg])
    const ok = ratio >= min
    if (!ok) failures++
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2).padStart(5)} : 1  (min ${min})  ` +
        `${fg} on ${bg}  - ${what}`,
    )
  }
}

console.log(
  failures === 0
    ? '\nAll pairs meet their floor and every value is inside sRGB.'
    : `\n${failures} problem(s).`,
)
process.exit(failures === 0 ? 0 : 1)
