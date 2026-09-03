import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseCss } from './support/parse-css.ts'

const registersCss = readFileSync(resolve(process.cwd(), 'src/registers.css'), 'utf8')
const blocks = parseCss(registersCss, 'src/registers.css')

const nulling = blocks.find((block) => block.selector === '@theme')?.declarations ?? {}
const mapped = blocks.find((block) => block.selector === '@theme inline')?.declarations ?? {}
const components = blocks.filter((block) => block.atRules.includes('@layer components'))

const control = components.find((block) => block.selector === '.fds-control')?.declarations ?? {}

/** Only a reference to one of our own tokens counts as mapped. */
const isTokenReference = (value: string) => /^var\(--fds-[a-z0-9-]+\)$/.test(value)

// A palette that is merely extended leaves the defaults available, and available
// means eventually used. These checks are what make "nulled, not extended" a
// fact rather than an intention.
describe('nulled default theme', () => {
  it('removes every namespace that carries visual identity', () => {
    for (const namespace of [
      '--color-*',
      '--font-*',
      '--text-*',
      '--font-weight-*',
      '--tracking-*',
      '--leading-*',
      '--radius-*',
      '--shadow-*',
      '--inset-shadow-*',
      '--drop-shadow-*',
      '--ease-*',
    ]) {
      expect(nulling[namespace], `${namespace} still carries Tailwind's defaults`).toBe('initial')
    }
  })

  it('keeps the structural namespaces, which carry no identity', () => {
    // Nulling breakpoints would break responsive utilities for no gain in
    // identity, so they are deliberately left alone.
    expect(nulling['--breakpoint-*']).toBeUndefined()
    expect(nulling['--container-*']).toBeUndefined()
  })

  it('reintroduces no Tailwind default colour', () => {
    const reintroduced = Object.keys(mapped).filter((name) =>
      /^--color-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d/.test(
        name,
      ),
    )
    expect(reintroduced).toEqual([])
  })
})

describe('utility mapping', () => {
  it('maps something', () => {
    expect(Object.keys(mapped).length).toBeGreaterThan(20)
  })

  it('points every mapped utility at a variable, never a literal', () => {
    for (const [name, value] of Object.entries(mapped)) {
      expect(isTokenReference(value), `${name} resolves to "${value}" rather than a token`).toBe(
        true,
      )
    }
  })

  it('claims the colour names the primitives are drawn with', () => {
    for (const name of [
      '--color-canvas',
      '--color-surface',
      '--color-border',
      '--color-border-strong',
      '--color-ink',
      '--color-ink-muted',
      '--color-accent',
      '--color-focus',
      '--color-danger',
    ]) {
      expect(mapped[name], `${name} is not claimed`).toBeTruthy()
    }
  })

  it('maps both font families', () => {
    expect(mapped['--font-sans']).toBe('var(--fds-font-sans)')
    expect(mapped['--font-mono']).toBe('var(--fds-font-mono)')
  })
})

describe('control register', () => {
  it('exists in the components layer', () => {
    expect(components.length).toBeGreaterThan(0)
    expect(Object.keys(control).length).toBeGreaterThan(0)
  })

  it('takes its whole geometry from tokens', () => {
    for (const property of [
      'block-size',
      'border-radius',
      'padding-inline',
      'font-size',
      'line-height',
    ]) {
      const value = control[property]
      expect(value, `.fds-control has no ${property}`).toBeTruthy()
      expect(
        (value ?? '').includes('var(--fds-'),
        `.fds-control ${property} is "${value}" rather than a token`,
      ).toBe(true)
    }
  })

  it('stands at the touch target, not below it', () => {
    expect(control['block-size']).toBe('var(--fds-control-md)')
  })

  it('declares a focus-visible state', () => {
    const focus = components.find((block) => block.selector.includes(':focus-visible'))
    expect(focus, 'no :focus-visible rule in the components layer').toBeTruthy()
    expect(JSON.stringify(focus?.declarations)).toContain('--fds-focus')
  })

  it('declares a disabled state that does not rely on opacity', () => {
    // A selector can mention the state while excluding it - the hover rule does
    // exactly that - so look for one that selects it rather than negates it.
    const disabled = components.find(
      (block) =>
        /:disabled|\[aria-disabled='true']/.test(block.selector) &&
        !block.selector.includes(':not('),
    )
    expect(disabled, 'no disabled rule in the components layer').toBeTruthy()
    expect(disabled?.declarations['opacity']).toBeUndefined()
    expect(JSON.stringify(disabled?.declarations)).toContain('--fds-disabled')
  })
})

describe('motion', () => {
  it('declares the spin the busy indicator uses', () => {
    const spin = components.find((block) => block.selector === '.fds-spin')

    expect(spin, 'no .fds-spin rule in the components layer').toBeTruthy()
    expect(spin?.declarations['animation']).toBeTruthy()
  })

  it('takes the spin duration from a token, not a number', () => {
    const spin = components.find((block) => block.selector === '.fds-spin')

    expect(spin?.declarations['animation']).toContain('var(--fds-duration-')
  })

  it('declares the keyframes it animates', () => {
    expect(registersCss).toMatch(/@keyframes\s+fds-spin/)
  })

  it('stops the spin entirely under reduced motion', () => {
    // A near-zero duration on an infinite animation is not "stopped": every
    // frame samples a different angle, and the arc flickers. Only `none` stops.
    const reduced = blocks.find(
      (block) =>
        block.selector === '.fds-spin' &&
        block.atRules.some((rule) => rule.includes('prefers-reduced-motion')),
    )

    expect(reduced, 'no reduced-motion rule for .fds-spin').toBeTruthy()
    expect(reduced?.declarations['animation']).toBe('none')
  })
})

describe('type scale mapping', () => {
  const steps = ['display', '2xl', 'xl', 'lg', 'base', 'sm', 'xs', 'code', 'key']

  it('gives every text step its line height, tracking and weight through the step itself', () => {
    // Tailwind v4 reads these three keys when it emits `text-<step>`. Without
    // them the utility sets a size and nothing else, and every component
    // inherits the body's line height.
    for (const step of steps) {
      expect(mapped[`--text-${step}--line-height`]).toBe(`var(--fds-leading-${step})`)
      expect(mapped[`--text-${step}--letter-spacing`]).toBe(`var(--fds-tracking-${step})`)
      expect(mapped[`--text-${step}--font-weight`]).toBe(`var(--fds-weight-${step})`)
    }
  })

  it('maps the four named weights, so a component can depart from a step on purpose', () => {
    for (const weight of ['light', 'regular', 'medium', 'semibold']) {
      expect(mapped[`--font-weight-${weight}`]).toBe(`var(--fds-weight-${weight})`)
    }
  })
})

describe('the inert action wins', () => {
  it('declares the inert state in the utilities layer, where the variant colours live', () => {
    // Variant colours are utilities. A rule in the components layer loses to
    // them however specific it is, so the inert state has to sit in the same
    // layer, after them.
    const inert = blocks.find(
      (block) =>
        block.selector.includes('.fds-action:disabled') &&
        block.atRules.includes('@layer utilities'),
    )

    expect(inert, 'no inert action rule in the utilities layer').toBeTruthy()
    expect(inert?.declarations['background-color']).toBe('var(--fds-disabled-surface)')
    expect(inert?.declarations['color']).toBe('var(--fds-disabled-ink)')
  })

  it('leaves no inert action rule in the components layer to disagree with it', () => {
    const stale = components.find((block) => block.selector.includes('.fds-action:disabled'))
    expect(stale).toBeUndefined()
  })
})

describe('the ring is an outline', () => {
  const rings = components.filter((block) => block.selector.includes(':focus-visible'))

  it('draws every focus-visible ring with outline and outline-offset from the tokens', () => {
    // Forced-colours mode keeps outlines and discards shadows, and an outline
    // is not clipped by an ancestor's overflow.
    expect(rings.length).toBeGreaterThan(0)
    for (const ring of rings) {
      expect(ring.declarations['outline'], `${ring.selector} has no outline`).toContain(
        'var(--fds-focus)',
      )
      expect(ring.declarations['outline-offset'], `${ring.selector} has no offset`).toContain(
        'var(--fds-focus-offset)',
      )
      expect(ring.declarations['box-shadow']).toBeUndefined()
    }
  })

  it('never turns the outline off', () => {
    for (const block of blocks) {
      expect(block.declarations['outline'], `${block.selector} sets outline: none`).not.toBe('none')
    }
  })
})

describe('touch', () => {
  it('opts controls and actions out of the double-tap delay', () => {
    const action = components.find((block) => block.selector === '.fds-action')?.declarations
    expect(control['touch-action']).toBe('manipulation')
    expect(action?.['touch-action']).toBe('manipulation')
  })
})

describe('placeholder', () => {
  it('is text, and wears an ink measured at the text floor on the control surface', () => {
    const placeholder = components.find((block) => block.selector === '.fds-control::placeholder')
    expect(placeholder?.declarations['color']).toBe('var(--fds-ink-muted)')
  })
})
