import { describe, expect, it } from 'vitest'
import * as api from '../src/index.ts'

// What this file exports is the contract. A name leaving it is a breaking change
// for every consuming project, so the surface is asserted rather than assumed.
describe('public API', () => {
  it('exports the Button component', () => {
    expect(api.Button).toBeTruthy()
  })

  it('exports the values a consumer needs to type their own props', () => {
    expect(api.BUTTON_VARIANTS).toEqual(['primary', 'secondary', 'ghost', 'destructive'])
    expect(api.BUTTON_SIZES).toEqual(['sm', 'md', 'lg'])
  })

  it('exports nothing else yet', () => {
    // Not pedantry: an accidental export is as binding as a deliberate one, and
    // this is the cheapest moment to notice one.
    expect(Object.keys(api).sort()).toEqual(['BUTTON_SIZES', 'BUTTON_VARIANTS', 'Button'])
  })
})
