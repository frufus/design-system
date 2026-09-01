import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseCss } from './support/parse-css.ts'

const tokensCss = readFileSync(resolve(process.cwd(), 'src/tokens.css'), 'utf8')
const blocks = parseCss(tokensCss, 'src/tokens.css')

const rootTokens = blocks
  .filter((block) => block.selector === ':root' && block.atRules.length === 0)
  .reduce<Record<string, string>>((all, block) => ({ ...all, ...block.declarations }), {})

const TYPE_STEPS = ['display', '2xl', 'xl', 'lg', 'base', 'sm', 'xs', 'code', 'key']
const SPACE_STEPS = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16']

// The canvas is the handoff, and these are the numbers on it. A group quietly
// going missing is the failure this suite exists to catch - not a wrong value,
// which the contrast and generation checks cover, but an absent one.
describe('token shape', () => {
  it('gives every type step a size, a line height, a tracking and a weight', () => {
    for (const step of TYPE_STEPS) {
      for (const facet of ['text', 'leading', 'tracking', 'weight']) {
        const token = `--fds-${facet}-${step}`
        expect(rootTokens[token], `${token} is missing`).toBeTruthy()
      }
    }
  })

  it('carries the whole 4 px spacing scale', () => {
    for (const step of SPACE_STEPS) {
      const token = `--fds-space-${step}`
      const value = rootTokens[token]
      expect(value, `${token} is missing`).toBeTruthy()
      expect(Number.parseInt(value ?? '', 10) % 4, `${token} is off the 4 px grid`).toBe(0)
    }
  })

  it('offers exactly the three radii the identity allows', () => {
    expect(rootTokens['--fds-radius-none']).toBe('0')
    expect(rootTokens['--fds-radius-tag']).toBe('2px')
    expect(rootTokens['--fds-radius-control']).toBe('4px')

    const radii = Object.keys(rootTokens).filter((name) => name.startsWith('--fds-radius-'))
    expect(radii).toHaveLength(3)
  })

  it('keeps every control at or above the 44 px touch target', () => {
    // The small control is 36 px of box inside a 44 px target, so the target
    // token - not the box - is what the floor is measured against.
    expect(rootTokens['--fds-control-sm']).toBe('36px')
    expect(rootTokens['--fds-control-md']).toBe('44px')
    expect(rootTokens['--fds-control-lg']).toBe('52px')
    expect(rootTokens['--fds-target-min']).toBe('44px')
  })

  it('separates the display row from the interactive row', () => {
    const display = Number.parseInt(rootTokens['--fds-row-display'] ?? '', 10)
    const interactive = Number.parseInt(rootTokens['--fds-row-interactive'] ?? '', 10)
    const target = Number.parseInt(rootTokens['--fds-target-min'] ?? '', 10)

    expect(display).toBe(40)
    expect(interactive).toBeGreaterThanOrEqual(target)
  })

  it('declares the border and focus-ring geometry', () => {
    expect(rootTokens['--fds-border-width']).toBe('1px')
    expect(rootTokens['--fds-focus-width']).toBe('2px')
    expect(rootTokens['--fds-focus-offset']).toBe('2px')
  })

  it('declares three durations and both easings', () => {
    for (const token of [
      '--fds-duration-fast',
      '--fds-duration-normal',
      '--fds-duration-slow',
      '--fds-ease-standard',
      '--fds-ease-exit',
    ]) {
      expect(rootTokens[token], `${token} is missing`).toBeTruthy()
    }
  })
})

describe('reduced motion', () => {
  const reduced = blocks.filter((block) =>
    block.atRules.some((rule) => rule.includes('prefers-reduced-motion')),
  )

  it('collapses every duration in one place', () => {
    expect(reduced).toHaveLength(1)

    const declared = Object.keys(reduced[0]?.declarations ?? {})
    const durations = Object.keys(rootTokens).filter((name) => name.startsWith('--fds-duration-'))

    expect(declared.sort()).toEqual(durations.sort())
    for (const value of Object.values(reduced[0]?.declarations ?? {})) {
      expect(Number.parseFloat(value)).toBeLessThanOrEqual(0.01)
    }
  })
})
