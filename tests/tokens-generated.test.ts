import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BEGIN_MARKER, END_MARKER, renderColourTokens } from '../tools/build-tokens.mjs'

// Vitest serves modules over a dev-server URL, so import.meta.url is not a file
// path here. The suite runs from the project root, which is what these resolve
// against.
const tokensCss = readFileSync(resolve(process.cwd(), 'src/tokens.css'), 'utf8')

function generatedRegion(source: string): string {
  const start = source.indexOf(BEGIN_MARKER)
  const end = source.indexOf(END_MARKER)
  if (start === -1 || end === -1) {
    throw new Error('src/tokens.css has no generated colour region')
  }
  return source.slice(start + BEGIN_MARKER.length, end)
}

// The canvas and the stylesheet have to keep saying the same thing. Both come
// from the measured palette, so a hand edit to a colour in the committed file is
// a drift this test exists to catch.
describe('generated colour tokens', () => {
  it('committed src/tokens.css matches a fresh generation', () => {
    expect(generatedRegion(tokensCss)).toBe(generatedRegion(BEGIN_MARKER + renderColourTokens() + END_MARKER))
  })

  it('declares light on the bare :root, so no token exists only in a media query', () => {
    const region = generatedRegion(tokensCss)
    const bareRoot = region.indexOf(':root {')

    expect(bareRoot).toBeGreaterThanOrEqual(0)
    expect(region.slice(0, bareRoot)).not.toContain('@media')
  })

  it('lets an explicit light choice win under a dark system', () => {
    expect(generatedRegion(tokensCss)).toContain(":root:not([data-theme='light'])")
  })
})
