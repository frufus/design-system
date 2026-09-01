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
