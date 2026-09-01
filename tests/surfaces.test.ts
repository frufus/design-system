import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Badge from '../src/components/Badge.vue'
import Card from '../src/components/Card.vue'
import EmptyState from '../src/components/EmptyState.vue'
import { BADGE_TONES, badgeToneClasses } from '../src/classMaps.ts'

describe('Badge tones', () => {
  it('has an entry for every documented tone', () => {
    for (const tone of BADGE_TONES) {
      expect(badgeToneClasses[tone], `${tone} has no entry`).toBeTruthy()
    }
    expect(Object.keys(badgeToneClasses).sort()).toEqual([...BADGE_TONES].sort())
  })

  it('pairs every soft fill with its own measured ink', () => {
    // A soft fill wearing borrowed ink is the classic way a badge clears its
    // floor in one appearance and fails it in the other. The rule is about the
    // pairing, not about which tones happen to have a fill - `outline` has none.
    for (const tone of BADGE_TONES) {
      const classes = badgeToneClasses[tone]
      const fill = /\bbg-([a-z-]+)-soft\b/.exec(classes)
      if (!fill) continue

      expect(classes, `${tone} fills with ${fill[1]} but does not use its ink`).toContain(
        `text-${fill[1]}-ink`,
      )
    }
  })

  it('gives every tone an ink of some kind', () => {
    for (const tone of BADGE_TONES) {
      expect(badgeToneClasses[tone], `${tone} sets no text colour`).toMatch(/\btext-/)
    }
  })

  it('holds literal class names', () => {
    for (const value of Object.values(badgeToneClasses)) {
      expect(value).not.toContain('${')
    }
  })
})

describe('Badge', () => {
  it('takes its label from the project', () => {
    const wrapper = mount(Badge, { slots: { default: 'Verified' } })

    expect(wrapper.text()).toBe('Verified')
  })

  it('hides the status mark from assistive technology', () => {
    // The text already names the status; a second announcement interrupts.
    const wrapper = mount(Badge, {
      props: { tone: 'success', mark: true },
      slots: { default: 'Verified' },
    })
    const mark = wrapper.get('[data-fds-mark]')

    expect(mark.attributes('aria-hidden')).toBe('true')
  })

  it('shows no mark unless asked', () => {
    const wrapper = mount(Badge, { props: { tone: 'success' }, slots: { default: 'Verified' } })

    expect(wrapper.find('[data-fds-mark]').exists()).toBe(false)
  })

  it('falls back to neutral for an unknown tone', () => {
    const wrapper = mount(Badge, {
      props: { tone: 'shouty' as unknown as 'neutral' },
      slots: { default: 'Draft' },
    })

    expect(wrapper.classes().join(' ')).toContain(badgeToneClasses.neutral.split(' ')[0])
  })
})

describe('Card', () => {
  it('is not a control when it only presents content', () => {
    const wrapper = mount(Card, { slots: { default: 'Mephiston Red' } })

    expect(wrapper.element.tagName).not.toBe('BUTTON')
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('is a real button when it acts', () => {
    // Not a div with role and tabindex: the platform already implements Enter,
    // Space, focus and the disabled state, and each is a place to get it wrong.
    const wrapper = mount(Card, { props: { interactive: true }, slots: { default: 'Open' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('emits when an interactive card is activated', async () => {
    const wrapper = mount(Card, { props: { interactive: true }, slots: { default: 'Open' } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('wears the shared focus ring when it acts', () => {
    const wrapper = mount(Card, { props: { interactive: true }, slots: { default: 'Open' } })

    expect(wrapper.classes()).toContain('fds-focus-ring')
  })

  it('renders no strip that has nothing in it', () => {
    const wrapper = mount(Card, { slots: { default: 'Body' } })

    expect(wrapper.find('[data-fds-card-header]').exists()).toBe(false)
    expect(wrapper.find('[data-fds-card-footer]').exists()).toBe(false)
  })

  it('renders the strips a project fills', () => {
    const wrapper = mount(Card, {
      slots: { header: 'Workspace', default: 'Body', footer: 'v0.1.0' },
    })

    expect(wrapper.get('[data-fds-card-header]').text()).toBe('Workspace')
    expect(wrapper.get('[data-fds-card-footer]').text()).toBe('v0.1.0')
  })

  it('uses no shadow in either appearance', () => {
    const classes = mount(Card, { props: { interactive: true }, slots: { default: 'Open' } })
      .classes()
      .join(' ')

    expect(classes).not.toMatch(/\bshadow-/)
  })
})

describe('EmptyState', () => {
  it('shows only the words the project supplied', () => {
    const wrapper = mount(EmptyState, {
      slots: {
        count: '0 items',
        title: 'Nothing on the shelf yet',
        default: 'Add the paints you own.',
      },
    })
    const words = wrapper
      .text()
      .replace('0 items', '')
      .replace('Nothing on the shelf yet', '')
      .replace('Add the paints you own.', '')

    expect(words.trim()).toBe('')
  })

  it('renders without an action when none is given', () => {
    const wrapper = mount(EmptyState, { slots: { title: 'Nothing yet' } })

    expect(wrapper.find('[data-fds-empty-action]').exists()).toBe(false)
  })

  it('renders the action a project supplies', () => {
    const wrapper = mount(EmptyState, {
      slots: { title: 'Nothing yet', action: '<button>Add a paint</button>' },
    })

    expect(wrapper.get('[data-fds-empty-action]').text()).toBe('Add a paint')
  })
})
