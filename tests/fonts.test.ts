import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseCss } from './support/parse-css.ts'

const root = process.cwd()
const tokensCss = readFileSync(resolve(root, 'src/tokens.css'), 'utf8')
const blocks = parseCss(tokensCss, 'src/tokens.css')

const fontFaces = blocks.filter((block) => block.selector === '@font-face')

// The stylesheet declares :root more than once - the generated colour region and
// the hand-written half each have their own block. A browser merges them, so the
// checks read them merged too.
const rootTokens = blocks
  .filter((block) => block.selector === ':root' && block.atRules.length === 0)
  .reduce<Record<string, string>>((all, block) => ({ ...all, ...block.declarations }), {})

/** Every url(...) target in a src declaration, unquoted. */
function sources(declaration: string): string[] {
  return [...declaration.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map(
    (match) => match[2] ?? '',
  )
}

// The package promises the interface renders in the intended typeface with no
// request leaving the consuming project's origin - including with no network at
// all. That promise is only as good as the files actually being there.
describe('vendored typefaces', () => {
  it('declares one face per family', () => {
    expect(fontFaces).toHaveLength(2)
  })

  it('serves every face from a file inside the package', () => {
    for (const face of fontFaces) {
      const src = face.declarations['src'] ?? ''
      const urls = sources(src)

      expect(urls.length).toBeGreaterThan(0)
      for (const url of urls) {
        expect(url.startsWith('http'), `${url} is fetched from a host`).toBe(false)
        expect(existsSync(resolve(root, 'src', url)), `${url} is missing on disk`).toBe(true)
      }
    }
  })

  it('states a weight range on every face', () => {
    // The mono variable's default instance is its lightest, so a face that omits
    // the range renders far too thin wherever a weight is not spelled out.
    for (const face of fontFaces) {
      expect(face.declarations['font-weight']).toBe('200 800')
    }
  })

  it('declares font-display on every face', () => {
    for (const face of fontFaces) {
      expect(face.declarations['font-display']).toBe('swap')
    }
  })

  it('names the same families in the font tokens', () => {
    const families = fontFaces.map((face) => face.declarations['font-family'] ?? '')
    const sans = rootTokens['--fds-font-sans'] ?? ''
    const mono = rootTokens['--fds-font-mono'] ?? ''

    expect(families).toContain("'Atkinson Hyperlegible Next'")
    expect(families).toContain("'Atkinson Hyperlegible Mono'")
    expect(sans).toContain('Atkinson Hyperlegible Next')
    expect(mono).toContain('Atkinson Hyperlegible Mono')
  })

  it('gives every font token a fallback beyond the vendored family', () => {
    for (const token of ['--fds-font-sans', '--fds-font-mono']) {
      const stack = (rootTokens[token] ?? '').split(',')
      expect(stack.length, `${token} has no fallback`).toBeGreaterThan(1)
    }
  })

  it('ships the licence beside the fonts', () => {
    expect(existsSync(resolve(root, 'src/fonts/OFL.txt'))).toBe(true)
    const licence = readFileSync(resolve(root, 'src/fonts/OFL.txt'), 'utf8')
    expect(licence).toContain('SIL OPEN FONT LICENSE')
  })

  it('names the author in NOTICE', () => {
    const notice = readFileSync(resolve(root, 'NOTICE'), 'utf8')
    expect(notice).toContain('Braille Institute')
    expect(notice).toContain('SIL Open Font License')
  })
})
