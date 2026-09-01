// @vitest-environment jsdom
import axe from 'axe-core'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import Button from '../src/components/Button.vue'
import Badge from '../src/components/Badge.vue'
import Card from '../src/components/Card.vue'
import Combobox from '../src/components/Combobox.vue'
import Dialog from '../src/components/Dialog.vue'
import EmptyState from '../src/components/EmptyState.vue'
import Input from '../src/components/Input.vue'
import Select from '../src/components/Select.vue'

/**
 * What this file does and does not cover.
 *
 * It checks structure and ARIA: names, roles, label association, references that
 * resolve, duplicated identifiers. Those are the failures a component can carry
 * on its own, and they are exactly what this package should catch before a
 * consuming project inherits them.
 *
 * It does NOT check colour contrast, and says so by disabling that rule rather
 * than letting it pass vacuously: no stylesheet is loaded here, so axe would be
 * sampling unstyled text and reporting success about nothing. Contrast is proven
 * in `appearance.test.ts`, which computes all 54 pairs from the shipped tokens -
 * a stronger claim than sampling rendered pixels.
 */
const RULES_OFF = {
  'color-contrast': { enabled: false },
} satisfies axe.RuleObject

async function violationsIn(element: Element): Promise<string[]> {
  const results = await axe.run(element, { rules: RULES_OFF })
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`)
}

/** The appearance is an attribute on the document, exactly as in production. */
function withAppearance(appearance: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', appearance)
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  document.body.replaceChildren()
})

const appearances = ['light', 'dark'] as const
const label = 'Workspace name'
const description = 'Everyone you invite sees this name.'
const error = 'Needs at least two characters.'

describe('Input accessibility', () => {
  for (const appearance of appearances) {
    it(`has no violations in ${appearance}, with a description`, async () => {
      withAppearance(appearance)
      const wrapper = mount(Input, {
        props: { label, description, modelValue: 'Studio' },
        attachTo: document.body,
      })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })

    it(`has no violations in ${appearance}, with an error`, async () => {
      withAppearance(appearance)
      const wrapper = mount(Input, {
        props: { label, description, error, modelValue: 'S' },
        attachTo: document.body,
      })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })
  }
})

describe('Select accessibility', () => {
  const options = '<option value="system">Follow the system</option>'

  for (const appearance of appearances) {
    it(`has no violations in ${appearance}, with a description`, async () => {
      withAppearance(appearance)
      const wrapper = mount(Select, {
        props: { label, description },
        slots: { default: options },
        attachTo: document.body,
      })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })

    it(`has no violations in ${appearance}, with an error`, async () => {
      withAppearance(appearance)
      const wrapper = mount(Select, {
        props: { label, description, error },
        slots: { default: options },
        attachTo: document.body,
      })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })
  }
})

describe('Button accessibility', () => {
  it('has no violations while working', async () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Save changes' },
      attachTo: document.body,
    })

    expect(await violationsIn(wrapper.element)).toEqual([])
  })

  it('catches an icon-only button with no name', async () => {
    // Proves the check works rather than passing vacuously: this is the mistake
    // an icon-only button invites, and it must be reported.
    const wrapper = mount(Button, {
      slots: { default: '<svg aria-hidden="true"></svg>' },
      attachTo: document.body,
    })

    expect(await violationsIn(wrapper.element)).toContainEqual(
      expect.stringContaining('button-name'),
    )
  })

  it('accepts the name a project supplies for one', async () => {
    const wrapper = mount(Button, {
      attrs: { 'aria-label': 'Open the menu' },
      slots: { default: '<svg aria-hidden="true"></svg>' },
      attachTo: document.body,
    })

    expect(await violationsIn(wrapper.element)).toEqual([])
  })
})

describe('Surface accessibility', () => {
  for (const appearance of appearances) {
    it(`has no violations for a badge in ${appearance}`, async () => {
      withAppearance(appearance)
      const wrapper = mount(Badge, {
        props: { tone: 'success', mark: true },
        slots: { default: 'Verified' },
        attachTo: document.body,
      })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })

    it(`has no violations for an interactive card in ${appearance}`, async () => {
      withAppearance(appearance)
      const wrapper = mount(Card, {
        props: { interactive: true },
        slots: { default: 'Evil Sunz Scarlet' },
        attachTo: document.body,
      })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })

    it(`has no violations for an empty state in ${appearance}`, async () => {
      withAppearance(appearance)
      const wrapper = mount(EmptyState, {
        slots: { title: 'Nothing on the shelf yet', default: 'Add the paints you own.' },
        attachTo: document.body,
      })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })
  }
})

describe('Dialog accessibility', () => {
  for (const appearance of appearances) {
    it(`has no violations in its markup, in ${appearance}`, async () => {
      // The modal behaviour - trapping, inertness, focus restoration - is the
      // browser's, and this DOM implements neither it nor showModal. So the
      // dialog is mounted closed and its `open` attribute is set from here, as
      // test scaffolding, to make the markup visible to axe. What is checked is
      // the naming and the structure; the behaviour belongs to the end-to-end
      // pass over the built catalog.
      withAppearance(appearance)
      const wrapper = mount(Dialog, {
        props: { open: false, title: 'Remove Mephiston Red from your shelf?' },
        slots: { default: 'Results will stop preferring paints you already own.' },
        attachTo: document.body,
      })
      wrapper.get('dialog').element.setAttribute('open', '')

      expect(await violationsIn(wrapper.element)).toEqual([])
    })
  }
})

describe('Combobox accessibility', () => {
  const options = [
    { value: 'mephiston', label: 'Mephiston Red' },
    { value: 'khorne', label: 'Khorne Red' },
  ]

  for (const appearance of appearances) {
    it(`has no violations with the list open, in ${appearance}`, async () => {
      withAppearance(appearance)
      const wrapper = mount(Combobox, {
        props: { label: 'Paint', options, modelValue: 'khorne' },
        attachTo: document.body,
      })

      await wrapper.get('input').trigger('keydown', { key: 'ArrowDown' })

      expect(await violationsIn(wrapper.element)).toEqual([])
    })
  }
})
