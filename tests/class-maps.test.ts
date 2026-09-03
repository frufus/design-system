import { describe, expect, it } from 'vitest'
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_VARIANT,
  buttonSizeClasses,
  buttonVariantClasses,
  resolveKey,
} from '../src/classMaps.ts'

// Every class the build sees has to be findable by searching for it - that is
// the rule, and it is also how Tailwind's scanner works. A class name assembled
// from a variable is a class Tailwind never emits.
describe('class maps', () => {
  it('has an entry for every documented variant', () => {
    for (const variant of BUTTON_VARIANTS) {
      expect(buttonVariantClasses[variant], `${variant} has no entry`).toBeTruthy()
    }
    expect(Object.keys(buttonVariantClasses).sort()).toEqual([...BUTTON_VARIANTS].sort())
  })

  it('has an entry for every documented size', () => {
    for (const size of BUTTON_SIZES) {
      expect(buttonSizeClasses[size], `${size} has no entry`).toBeTruthy()
    }
    expect(Object.keys(buttonSizeClasses).sort()).toEqual([...BUTTON_SIZES].sort())
  })

  it('holds literal class names, never a placeholder', () => {
    for (const value of [
      ...Object.values(buttonVariantClasses),
      ...Object.values(buttonSizeClasses),
    ]) {
      expect(value).not.toContain('${')
      expect(value).not.toContain('{{')
    }
  })

  it('falls back to the default rather than rendering unstyled', () => {
    expect(resolveKey('shouty', BUTTON_VARIANTS, DEFAULT_BUTTON_VARIANT)).toBe(
      DEFAULT_BUTTON_VARIANT,
    )
    expect(resolveKey(undefined, BUTTON_SIZES, DEFAULT_BUTTON_SIZE)).toBe(DEFAULT_BUTTON_SIZE)
  })

  it('keeps a documented value', () => {
    expect(resolveKey('ghost', BUTTON_VARIANTS, DEFAULT_BUTTON_VARIANT)).toBe('ghost')
  })

  it('keeps the action weight and tracking at every size', () => {
    // A size sets its type step, and a step now carries a weight and a tracking
    // of its own as utilities - which beat the register's. The action's own
    // weight and tracking ride along as utilities too, so the step cannot take
    // them.
    for (const size of BUTTON_SIZES) {
      expect(buttonSizeClasses[size], `${size} loses the action weight`).toContain('font-action')
      expect(buttonSizeClasses[size], `${size} loses the action tracking`).toContain(
        'tracking-action',
      )
    }
  })

  it('restores the touch target only where the box is below it', () => {
    // The small size is a 36 px box; the other two already clear 44.
    expect(buttonSizeClasses.sm).toContain('fds-target')
    expect(buttonSizeClasses.md).not.toContain('fds-target')
    expect(buttonSizeClasses.lg).not.toContain('fds-target')
  })
})
