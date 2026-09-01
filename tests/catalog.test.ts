import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

/** The file documents the consumer wiring in a comment; only what runs counts. */
const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

const previewCss = withoutComments(read('.storybook/preview.css'))
const previewTs = read('.storybook/preview.ts')
const mainTs = read('.storybook/main.ts')

// The catalog is the first thing to consume this package the way a project
// would. If its wiring drifts from the documented four lines, the rehearsal
// stops being one.
describe('consumer wiring, rehearsed', () => {
  it('imports Tailwind', () => {
    expect(previewCss).toContain("@import 'tailwindcss'")
  })

  it('declares a source directory, because Tailwind does not scan dependencies', () => {
    const match = /@source\s+'([^']+)'/.exec(previewCss)
    expect(match, 'no @source declaration').toBeTruthy()

    const sourcePath = resolve(process.cwd(), '.storybook', match?.[1] ?? '')
    expect(existsSync(sourcePath), `@source points at ${sourcePath}, which does not exist`).toBe(
      true,
    )
  })

  it('imports both package stylesheets', () => {
    expect(previewCss).toMatch(/@import\s+'[^']*tokens\.css'/)
    expect(previewCss).toMatch(/@import\s+'[^']*registers\.css'/)
  })

  it('brings its own Tailwind plugin, since the package ships source', () => {
    expect(mainTs).toContain('@tailwindcss/vite')
  })

  it('loads the accessibility addon', () => {
    expect(mainTs).toContain('@storybook/addon-a11y')
  })
})

describe('appearance toolbar', () => {
  it('offers the system preference and both explicit choices', () => {
    for (const value of ['system', 'light', 'dark']) {
      expect(previewTs).toContain(`value: '${value}'`)
    }
  })

  it('sets the attribute on the document rather than wrapping the story', () => {
    expect(previewTs).toContain('document.documentElement')
    expect(previewTs).toContain("setAttribute('data-theme'")
  })

  it('removes the attribute for the system choice instead of guessing', () => {
    // Guessing would bypass the stylesheet's prefers-color-scheme branch, which
    // is the branch a real visitor gets.
    expect(previewTs).toContain("removeAttribute('data-theme')")
  })

  it('starts on the system preference', () => {
    expect(previewTs).toMatch(/initialGlobals[\s\S]*appearance:\s*'system'/)
  })
})
