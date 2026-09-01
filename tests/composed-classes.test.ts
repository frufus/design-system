import { describe, expect, it } from 'vitest'
import { findComposedClasses, scanForComposedClasses } from '../tools/check-composed-classes.mjs'

// Tailwind emits a class only if it sees the name literally. A class assembled
// from a variable is therefore two failures at once: it cannot be found by
// searching, and it is never generated - so the element renders unstyled and
// nothing says why.
describe('composed class scanner', () => {
  it('finds a class name built from a variable', () => {
    expect(findComposedClasses('const c = `bg-${tone}-soft`')).toHaveLength(1)
  })

  it('finds one built with concatenation', () => {
    expect(findComposedClasses("const c = 'text-' + tone + '-ink'")).toHaveLength(1)
  })

  it('leaves a literal class list alone', () => {
    expect(findComposedClasses("const c = 'bg-accent text-ink-on-accent'")).toEqual([])
  })

  it('leaves an ordinary interpolated string alone', () => {
    expect(findComposedClasses('const message = `${count} items`')).toEqual([])
  })

  it('leaves a token reference in an arbitrary value alone', () => {
    // `h-[var(--fds-control-md)]` is literal; the braces belong to CSS, not to
    // an interpolation.
    expect(findComposedClasses("md: 'h-[var(--fds-control-md)] px-4 text-sm'")).toEqual([])
  })

  it('finds none in this package', () => {
    const offences = scanForComposedClasses(process.cwd())
    const rendered = offences.map((o) => `${o.file}:${o.line} ${o.matches.join(', ')}`).join('\n')

    expect(offences, `class names assembled from variables:\n${rendered}`).toEqual([])
  })
})
