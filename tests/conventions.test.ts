import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CHECKS, findStyleBlocks, scanForStyleBlocks } from '../tools/check-conventions.mjs'

describe('style-block scanner', () => {
  it('finds a scoped style block', () => {
    expect(findStyleBlocks('<style scoped>.a { color: red }</style>')).toEqual(['<style scoped>'])
  })

  it('finds an unscoped one too, because the problem is the values, not the scope', () => {
    expect(findStyleBlocks('<style>')).toEqual(['<style>'])
  })

  it('leaves the word alone in prose', () => {
    expect(findStyleBlocks('// the style block is forbidden')).toEqual([])
  })

  it('finds none in this package', () => {
    const offences = scanForStyleBlocks(process.cwd())
    const rendered = offences.map((o) => `${o.file}:${o.line}`).join('\n')

    expect(offences, `components carrying a stylesheet:\n${rendered}`).toEqual([])
  })
})

// A documented rule with no check is a wish, and a check nobody documented is a
// surprise. The two lists have to agree, and this is what makes them.
describe('the rules and the document agree', () => {
  const language = readFileSync(resolve(process.cwd(), 'docs/DESIGN-LANGUAGE.md'), 'utf8')

  it('documents every check that runs', () => {
    for (const check of CHECKS) {
      expect(language, `${check.id} runs but is not documented`).toContain(check.id)
    }
  })

  it('names no check that does not exist', () => {
    // Only the "Enforced by" lines are read, and only the backticked names that
    // look like a check id - a file path carries a dot and a slash, so a rule
    // enforced by a test suite rather than a check is not mistaken for one.
    const ids = new Set(CHECKS.map((check) => check.id))
    const mentioned = [...language.matchAll(/\*\*Enforced by\*\* `([a-z][a-z-]+)`/g)].map(
      (match) => match[1] ?? '',
    )

    expect(mentioned.length, 'no check is referenced at all').toBeGreaterThan(0)
    for (const id of mentioned) {
      expect(ids.has(id), `${id} is documented but does not exist`).toBe(true)
    }
  })

  it('gives every check a title and an explanation', () => {
    for (const check of CHECKS) {
      expect(check.title.length, `${check.id} has no title`).toBeGreaterThan(10)
      expect(check.explain.length, `${check.id} has no explanation`).toBeGreaterThan(20)
    }
  })
})
