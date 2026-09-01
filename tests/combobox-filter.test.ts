import { describe, expect, it } from 'vitest'
import { defaultMatcher, filterOptions } from '../src/comboboxFilter.ts'

const options = [
  { value: 'mephiston', label: 'Mephiston Red' },
  { value: 'evil-sunz', label: 'Evil Sunz Scarlet' },
  { value: 'khorne', label: 'Khorne Red' },
]

describe('default matcher', () => {
  it('matches anywhere in the label, not only at the start', () => {
    // Prefix-only matching is the thing people notice as broken about a native
    // select's typeahead.
    expect(defaultMatcher('red', options[0]!)).toBe(true)
    expect(defaultMatcher('Red', options[2]!)).toBe(true)
  })

  it('ignores case in both directions', () => {
    expect(defaultMatcher('MEPHISTON', options[0]!)).toBe(true)
    expect(defaultMatcher('mephiston', options[0]!)).toBe(true)
  })

  it('ignores surrounding whitespace', () => {
    expect(defaultMatcher('  red  ', options[0]!)).toBe(true)
  })

  it('rejects what is not there', () => {
    expect(defaultMatcher('blue', options[0]!)).toBe(false)
  })
})

describe('filterOptions', () => {
  it('offers everything for empty text', () => {
    expect(filterOptions(options, '')).toHaveLength(3)
    expect(filterOptions(options, '   ')).toHaveLength(3)
  })

  it('narrows to the matches', () => {
    expect(filterOptions(options, 'red').map((option) => option.value)).toEqual([
      'mephiston',
      'khorne',
    ])
  })

  it('returns nothing when nothing matches', () => {
    expect(filterOptions(options, 'ultramarine')).toEqual([])
  })

  it('keeps the order the project gave', () => {
    expect(filterOptions(options, 'r').map((option) => option.value)).toEqual([
      'mephiston',
      'evil-sunz',
      'khorne',
    ])
  })

  it('uses a matcher the project supplies instead', () => {
    // A project whose data needs accent folding or fuzzy matching replaces this
    // rather than working around it.
    const byValue = (query: string, option: { value: string }) => option.value.startsWith(query)

    expect(filterOptions(options, 'kh', byValue).map((option) => option.value)).toEqual(['khorne'])
  })
})
