import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BEGIN_MARKER, END_MARKER } from '../tools/build-tokens.mjs'
import { PAIRS, contrast, resolve as resolveOklch } from '../tools/palette-report.mjs'
import { parseCss } from './support/parse-css.ts'

const tokensCss = readFileSync(resolve(process.cwd(), 'src/tokens.css'), 'utf8')

const start = tokensCss.indexOf(BEGIN_MARKER)
const end = tokensCss.indexOf(END_MARKER)
if (start === -1 || end === -1) throw new Error('src/tokens.css has no generated colour region')

// Only the generated region carries colour. Parsing it on its own keeps the
// hand-written tokens - which are deliberately appearance-independent - out of a
// parity check they would fail for the right reason.
const colourBlocks = parseCss(tokensCss.slice(start + BEGIN_MARKER.length, end), 'tokens.css')

const bySelector = (selector: string, inMedia: boolean) =>
  colourBlocks.find(
    (block) => block.selector === selector && block.atRules.length === (inMedia ? 1 : 0),
  )?.declarations ?? {}

const light = bySelector(':root', false)
const darkPreferred = bySelector(":root:not([data-theme='light'])", true)
const darkChosen = bySelector(":root[data-theme='dark']", false)
const lightChosen = bySelector(":root[data-theme='light']", false)

const names = (block: Record<string, string>) => Object.keys(block).sort()

describe('appearance parity', () => {
  it('declares every colour token in all four blocks', () => {
    expect(names(light).length).toBeGreaterThan(0)
    expect(names(darkPreferred)).toEqual(names(light))
    expect(names(darkChosen)).toEqual(names(light))
    expect(names(lightChosen)).toEqual(names(light))
  })

  it('introduces no token that exists only inside a media query', () => {
    for (const token of Object.keys(darkPreferred)) {
      expect(light[token], `${token} is declared only under a media query`).toBeTruthy()
    }
  })

  it('gives the system preference and the explicit choice the same values', () => {
    expect(darkChosen).toEqual(darkPreferred)
    expect(lightChosen).toEqual(light)
  })

  it('actually differs between the appearances', () => {
    // A parity check passes trivially if both blocks hold the same values, which
    // would mean the dark appearance was never designed.
    const differing = Object.keys(light).filter((token) => light[token] !== darkChosen[token])
    expect(differing.length).toBeGreaterThan(Object.keys(light).length / 2)
  })
})

/** `oklch(0.518 0.088 196)` -> [0.518, 0.088, 196] */
function parseOklch(value: string, token: string): [number, number, number] {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value)
  if (!match) throw new Error(`${token} is not a plain oklch() value: ${value}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

describe('contrast floors', () => {
  const appearances = {
    light,
    dark: darkChosen,
  }

  for (const [appearance, tokens] of Object.entries(appearances)) {
    for (const [foreground, background, floor, what] of PAIRS) {
      it(`${appearance}: ${foreground} on ${background} clears ${floor}:1 - ${what}`, () => {
        const fg = tokens[`--fds-${foreground}`]
        const bg = tokens[`--fds-${background}`]
        expect(fg, `--fds-${foreground} is missing`).toBeTruthy()
        expect(bg, `--fds-${background} is missing`).toBeTruthy()

        const ratio = contrast(
          resolveOklch(parseOklch(fg ?? '', foreground)),
          resolveOklch(parseOklch(bg ?? '', background)),
        )

        expect(
          Number(ratio.toFixed(2)),
          `${foreground} on ${background} measured ${ratio.toFixed(2)}:1 against a floor of ${floor}`,
        ).toBeGreaterThanOrEqual(floor)
      })
    }
  }
})
