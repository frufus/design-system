import { describe, expect, it } from 'vitest'
import { CssParseError, parseCss } from './parse-css.ts'

// The checks that guard the token foundation must not match raw text: a regex
// happily passes a stylesheet whose dark block was swallowed by a missing brace.
// So everything downstream reads this parser's output instead, and this suite is
// what makes that output trustworthy.
describe('parseCss', () => {
  it('reads the declarations of a flat rule', () => {
    const blocks = parseCss(':root { --fds-ink: #131F22; --fds-canvas: #F7FBFC; }')

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.selector).toBe(':root')
    expect(blocks[0]?.declarations).toEqual({
      '--fds-ink': '#131F22',
      '--fds-canvas': '#F7FBFC',
    })
  })

  it('records enclosing at-rules outermost first', () => {
    const blocks = parseCss(`
      @media (prefers-color-scheme: dark) {
        @supports (color: oklch(0 0 0)) {
          :root:not([data-theme='light']) { --fds-ink: #EFF5F7; }
        }
      }
    `)

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.atRules).toEqual([
      '@media (prefers-color-scheme: dark)',
      '@supports (color: oklch(0 0 0))',
    ])
    expect(blocks[0]?.selector).toBe(":root:not([data-theme='light'])")
  })

  it('keeps a block that declares nothing', () => {
    const blocks = parseCss('@layer components { .fds-control { } }')

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.selector).toBe('.fds-control')
    expect(blocks[0]?.declarations).toEqual({})
  })

  it('preserves a value containing nested parentheses', () => {
    const blocks = parseCss('.a { box-shadow: 0 0 0 2px var(--fds-surface, oklch(1 0 0)); }')

    expect(blocks[0]?.declarations['box-shadow']).toBe('0 0 0 2px var(--fds-surface, oklch(1 0 0))')
  })

  it('keeps the last declaration when a property is repeated', () => {
    const blocks = parseCss(':root { --fds-ink: #000000; --fds-ink: #131F22; }')

    expect(blocks[0]?.declarations['--fds-ink']).toBe('#131F22')
  })

  it('throws rather than skipping a block that is never closed', () => {
    expect(() => parseCss(':root { --fds-ink: #131F22;', 'tokens.css')).toThrow(CssParseError)
    expect(() => parseCss(':root { --fds-ink: #131F22;', 'tokens.css')).toThrow(/tokens\.css/)
  })

  it('throws when a closing brace has no block to close', () => {
    expect(() => parseCss(':root { color: red; } }', 'registers.css')).toThrow(CssParseError)
  })

  it('reads an at-rule that holds declarations rather than rules', () => {
    const blocks = parseCss(`
      @font-face {
        font-family: 'Atkinson Hyperlegible Next';
        font-weight: 200 800;
        src: url('./fonts/sans.woff2') format('woff2');
      }
    `)

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.selector).toBe('@font-face')
    expect(blocks[0]?.atRules).toEqual([])
    expect(blocks[0]?.declarations['font-weight']).toBe('200 800')
    expect(blocks[0]?.declarations['font-family']).toBe("'Atkinson Hyperlegible Next'")
  })

  it('still nests an at-rule that holds rules', () => {
    const blocks = parseCss('@media print { @font-face { font-family: x; } }')

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.selector).toBe('@font-face')
    expect(blocks[0]?.atRules).toEqual(['@media print'])
  })

  it('ignores comments, including a brace inside one', () => {
    const blocks = parseCss(`
      /* a { not: a-rule } */
      :root { --fds-ink: #131F22; /* trailing */ }
    `)

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.declarations).toEqual({ '--fds-ink': '#131F22' })
  })
})
