import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from '../src/components/Button.vue'

const label = 'Save changes'

describe('Button behaviour', () => {
  it('emits when activated', async () => {
    const wrapper = mount(Button, { slots: { default: label } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('emits nothing when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true }, slots: { default: label } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('emits nothing while it is working', async () => {
    // The bug this state exists to prevent is the second submission, so the
    // component suppresses it rather than trusting an attribute to.
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: label } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('stays reachable by keyboard while it is working', () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: label } })
    const button = wrapper.get('button')

    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('aria-busy')).toBe('true')
  })

  it('leaves the tab order when disabled, as a native button does', () => {
    const wrapper = mount(Button, { props: { disabled: true }, slots: { default: label } })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button').attributes('aria-busy')).toBeUndefined()
  })

  it('keeps the label visible while it is working', () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: label } })

    expect(wrapper.text()).toContain(label)
  })

  it('marks the busy indicator as decoration, since the label already speaks', () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: label } })
    const indicator = wrapper.find('[data-fds-busy]')

    expect(indicator.exists()).toBe(true)
    expect(indicator.attributes('aria-hidden')).toBe('true')
  })

  it('defaults its type to button, so it never submits a form by accident', () => {
    const wrapper = mount(Button, { slots: { default: label } })

    expect(wrapper.get('button').attributes('type')).toBe('button')
  })

  it('submits when a project asks it to', () => {
    const wrapper = mount(Button, { props: { type: 'submit' }, slots: { default: label } })

    expect(wrapper.get('button').attributes('type')).toBe('submit')
  })
})

describe('Button accessible name', () => {
  it('is the slotted label', () => {
    const wrapper = mount(Button, { slots: { default: label } })

    expect(wrapper.get('button').text()).toBe(label)
  })

  it('is whatever the project supplies for an icon-only button', () => {
    const wrapper = mount(Button, {
      attrs: { 'aria-label': 'Open the menu' },
      slots: { default: '<svg aria-hidden="true"></svg>' },
    })

    expect(wrapper.get('button').attributes('aria-label')).toBe('Open the menu')
  })

  it('contributes no words of its own', () => {
    const wrapper = mount(Button, { props: { loading: true }, slots: { default: label } })

    expect(wrapper.text().replace(label, '').trim()).toBe('')
  })
})

describe('Button appearance', () => {
  it('wears the action register and the shared ring on every variant', () => {
    for (const variant of ['primary', 'secondary', 'ghost', 'destructive'] as const) {
      const classes = mount(Button, { props: { variant }, slots: { default: label } })
        .get('button')
        .classes()

      expect(classes, `${variant} is missing the register`).toContain('fds-action')
      expect(classes, `${variant} is missing the ring`).toContain('fds-focus-ring')
    }
  })

  it('renders the classes its variant maps to', () => {
    const classes = mount(Button, { props: { variant: 'ghost' }, slots: { default: label } })
      .get('button')
      .classes()

    expect(classes).toContain('text-accent-ink')
    expect(classes).not.toContain('bg-accent')
  })

  it('falls back to the default variant rather than rendering unstyled', () => {
    const classes = mount(Button, {
      props: { variant: 'shouty' as unknown as 'primary' },
      slots: { default: label },
    })
      .get('button')
      .classes()

    expect(classes).toContain('bg-accent')
  })

  it('restores the touch target only at the small size', () => {
    const at = (size: 'sm' | 'md' | 'lg') =>
      mount(Button, { props: { size }, slots: { default: label } })
        .get('button')
        .classes()

    expect(at('sm')).toContain('fds-target')
    expect(at('md')).not.toContain('fds-target')
    expect(at('lg')).not.toContain('fds-target')
  })
})
