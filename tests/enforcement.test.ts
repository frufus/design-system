import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findLiteralColours, scan } from '../tools/check-literal-colours.mjs'

// Tokens are the only source of colour. That is a rule the build can hold, not
// a habit reviewers have to remember, which is what this scanner is for.
describe('literal colour scanner', () => {
  it('finds a hex literal', () => {
    expect(findLiteralColours('color: #017879;')).toEqual(['#017879'])
  })

  it('finds the short hex form', () => {
    expect(findLiteralColours('color: #fff;')).toEqual(['#fff'])
  })

  it('finds functional colour notations', () => {
    const found = findLiteralColours('a { color: rgb(1 2 3); background: oklch(0.5 0.1 200); }')
    expect(found).toEqual(['rgb(1 2 3)', 'oklch(0.5 0.1 200)'])
  })

  it('accepts a token reference', () => {
    expect(findLiteralColours('color: var(--fds-ink);')).toEqual([])
  })

  it('does not mistake a fragment link for a colour', () => {
    expect(findLiteralColours('<a href="#main">skip</a>')).toEqual([])
  })

  it('does not mistake a number for a colour function', () => {
    expect(findLiteralColours('transform: translate(10px, 4px);')).toEqual([])
  })
})

describe('the package holds to it', () => {
  it('has no colour literal outside the token stylesheet', () => {
    const offences = scan(process.cwd())
    const rendered = offences
      .map((o) => `${o.file}:${o.line} ${o.matches.join(', ')}`)
      .join('\n')

    expect(offences, `colour literals outside src/tokens.css:\n${rendered}`).toEqual([])
  })
})

describe('package exports', () => {
  const require = createRequire(import.meta.url)
  const pkg = require('../package.json') as {
    exports: Record<string, string>
    files: string[]
  }

  it('resolves every exported stylesheet to a file that exists', () => {
    for (const [entry, target] of Object.entries(pkg.exports)) {
      if (!entry.endsWith('.css')) continue
      expect(existsSync(resolve(process.cwd(), target)), `${entry} -> ${target} is missing`).toBe(
        true,
      )
    }
  })

  it('exports both stylesheets the documented wiring imports', () => {
    expect(pkg.exports['./tokens.css']).toBeTruthy()
    expect(pkg.exports['./registers.css']).toBeTruthy()
  })

  it('ships the fonts, because src is published whole', () => {
    expect(pkg.files).toContain('src')
    expect(existsSync(resolve(process.cwd(), 'src/fonts/OFL.txt'))).toBe(true)
  })

  it('states the four-line wiring where a consuming session will read it', () => {
    const config = readFileSync(resolve(process.cwd(), 'openspec/config.yaml'), 'utf8')
    expect(config).toContain("@source '../node_modules/@frufus/design-system/src'")
    expect(config).toContain("@import '@frufus/design-system/tokens.css'")
    expect(config).toContain("@import '@frufus/design-system/registers.css'")
  })
})
