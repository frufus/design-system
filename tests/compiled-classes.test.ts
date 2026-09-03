// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { compile } from '@tailwindcss/node'
import { Scanner } from '@tailwindcss/oxide'
import { beforeAll, describe, expect, it } from 'vitest'
import * as classMaps from '../src/classMaps.ts'

/**
 * The check the other checks could not make.
 *
 * `no-composed-classes` proves every class name is literal. The class-map tests
 * prove the maps are complete. Neither asks whether a literal class name, once
 * Tailwind has run, produces any CSS at all - and after the default theme is
 * nulled, a utility whose namespace was not remapped produces nothing, silently.
 * A component can wear `font-medium` for months and render at 400.
 *
 * So this compiles the rehearsed consumer wiring exactly as the Vite plugin
 * would, then asks the compiled stylesheet whether every class a component or a
 * class map wears is in it, and whether the cascade lands where the register
 * says it does.
 */

const root = process.cwd()
const base = resolve(root, '.storybook')

const STEPS = ['display', '2xl', 'xl', 'lg', 'base', 'sm', 'xs', 'code', 'key']
const WEIGHTS = ['light', 'regular', 'medium', 'semibold']

/** Utilities the scale promises whether or not a component wears them yet. */
const PROBES = [...STEPS.map((step) => `text-${step}`), ...WEIGHTS.map((w) => `font-${w}`)]

let css = ''

beforeAll(async () => {
  const wiring = readFileSync(resolve(base, 'preview.css'), 'utf8')
  const compiler = await compile(wiring, { base, onDependency: () => {} })
  const scanner = new Scanner({ sources: compiler.sources })
  css = compiler.build([...scanner.scan(), ...PROBES])
})

/** Every class name a component wears: from `class` and `:class` attributes only. */
function classesInComponents(): Map<string, string> {
  const found = new Map<string, string>()
  const dir = resolve(root, 'src/components')

  for (const file of readdirSync(dir).filter((name) => name.endsWith('.vue'))) {
    const source = readFileSync(resolve(dir, file), 'utf8')

    for (const match of source.matchAll(/\sclass="([^"]*)"/g)) {
      for (const token of (match[1] ?? '').split(/\s+/)) if (token) found.set(token, file)
    }
    for (const match of source.matchAll(/\s:class="([^"]*)"/g)) {
      for (const literal of (match[1] ?? '').matchAll(/'([^']*)'/g)) {
        for (const token of (literal[1] ?? '').split(/\s+/)) if (token) found.set(token, file)
      }
    }
  }

  return found
}

/**
 * Every class name a class map holds. A map is any export whose name ends in
 * `Classes`, whether it is a string or a record of strings; the key lists and
 * defaults beside them hold prop values, not class names.
 */
function classesInMaps(): Map<string, string> {
  const found = new Map<string, string>()
  const collect = (value: unknown, from: string) => {
    if (typeof value === 'string') {
      for (const token of value.split(/\s+/)) if (token) found.set(token, from)
    } else if (value && typeof value === 'object') {
      for (const inner of Object.values(value)) collect(inner, from)
    }
  }
  for (const [name, value] of Object.entries(classMaps)) {
    if (name.endsWith('Classes')) collect(value, name)
  }
  return found
}

/** Tailwind escapes a class name the way CSS.escape does. */
const selectorFor = (name: string) => '.' + name.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`)

/** The declarations of the first rule whose selector starts with the class. */
function ruleFor(name: string): string | undefined {
  const selector = selectorFor(name)
  const at = css.indexOf(selector)
  if (at === -1) return undefined
  const open = css.indexOf('{', at)
  const close = css.indexOf('}', open)
  return css.slice(open + 1, close)
}

describe('every class a component wears produces a rule', () => {
  it('finds classes to check at all', () => {
    expect(classesInComponents().size).toBeGreaterThan(20)
    expect(classesInMaps().size).toBeGreaterThan(10)
  })

  it('compiles every class used in a component', () => {
    const dead = [...classesInComponents()]
      .filter(([name]) => !css.includes(selectorFor(name)))
      .map(([name, file]) => `${file}: ${name}`)

    expect(dead, `classes that compile to nothing:\n${dead.join('\n')}`).toEqual([])
  })

  it('compiles every class held in a class map', () => {
    const dead = [...classesInMaps()]
      .filter(([name]) => !css.includes(selectorFor(name)))
      .map(([name]) => name)

    expect(dead, `map entries that compile to nothing:\n${dead.join('\n')}`).toEqual([])
  })
})

describe('a type step carries all four facets', () => {
  for (const step of STEPS) {
    it(`text-${step} sets size, line height, tracking and weight from the step's tokens`, () => {
      const rule = ruleFor(`text-${step}`)
      expect(rule, `no rule for text-${step}`).toBeTruthy()
      expect(rule).toContain(`var(--fds-text-${step})`)
      expect(rule).toContain(`var(--fds-leading-${step})`)
      expect(rule).toContain(`var(--fds-tracking-${step})`)
      expect(rule).toContain(`var(--fds-weight-${step})`)
    })
  }

  it('lets a named weight depart from the step', () => {
    for (const weight of WEIGHTS) {
      const rule = ruleFor(`font-${weight}`)
      expect(rule, `no rule for font-${weight}`).toBeTruthy()
      expect(rule).toContain(`var(--fds-weight-${weight})`)
    }
  })

  it('emits a departure after the step it departs from, so the departure wins', () => {
    // Both are utilities; only source order decides. This reads the order out
    // of the compiled stylesheet rather than trusting Tailwind's sort.
    expect(css.indexOf('.font-medium')).toBeGreaterThan(css.indexOf('.text-sm'))
    expect(css.indexOf('.font-light')).toBeGreaterThan(css.indexOf('.text-xl'))
  })

  it('gives the action its own weight and tracking as utilities', () => {
    expect(ruleFor('font-action')).toContain('var(--fds-weight-action)')
    expect(ruleFor('tracking-action')).toContain('var(--fds-tracking-action)')
    expect(css.indexOf('.font-action')).toBeGreaterThan(css.indexOf('.text-sm'))
    expect(css.indexOf('.tracking-action')).toBeGreaterThan(css.indexOf('.text-sm'))
  })
})

describe('the cascade lands where the register says', () => {
  it('declares the inert action after every hover utility a button can wear', () => {
    const inert = css.indexOf('.fds-action:disabled')
    expect(inert, 'no inert rule for the action register').toBeGreaterThan(-1)

    const hovers = [...classesInMaps().keys()].filter((name) => name.startsWith('hover:'))
    expect(hovers.length).toBeGreaterThan(0)

    for (const name of hovers) {
      const at = css.indexOf(selectorFor(name))
      expect(at, `${name} was not compiled`).toBeGreaterThan(-1)
      expect(
        at,
        `${name} is declared after the inert rule and would repaint a disabled button`,
      ).toBeLessThan(inert)
    }
  })
})
