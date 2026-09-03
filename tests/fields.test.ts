import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Input from '../src/components/Input.vue'
import Select from '../src/components/Select.vue'

const label = 'Workspace name'
const description = 'Everyone you invite sees this name.'
const error = 'Needs at least two characters.'

describe('Input', () => {
  it('round-trips a value', async () => {
    const wrapper = mount(Input, { props: { label, modelValue: 'Studio' } })
    const input = wrapper.get('input')

    expect((input.element as HTMLInputElement).value).toBe('Studio')

    await input.setValue('Atelier')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['Atelier'])
  })

  it('wears the control register', () => {
    const wrapper = mount(Input, { props: { label } })

    expect(wrapper.get('input').classes()).toContain('fds-control')
  })

  it('is named by its label', () => {
    const wrapper = mount(Input, { props: { label }, attachTo: document.body })

    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('input').attributes('id'))
  })

  it('reports invalid and points at the message when given an error', () => {
    const wrapper = mount(Input, { props: { label, error }, attachTo: document.body })
    const input = wrapper.get('input')
    const id = input.attributes('aria-describedby')

    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find(`#${id}`).text()).toContain(error)
  })

  it('is inert when disabled', () => {
    const wrapper = mount(Input, { props: { label, disabled: true } })

    expect(wrapper.get('input').attributes('disabled')).toBeDefined()
  })

  it('passes its type through, so a project can ask for email or search', () => {
    const wrapper = mount(Input, { props: { label, type: 'email' } })

    expect(wrapper.get('input').attributes('type')).toBe('email')
  })

  it('defaults to text rather than guessing', () => {
    expect(mount(Input, { props: { label } }).get('input').attributes('type')).toBe('text')
  })

  it('shows only the words the project supplied', () => {
    const wrapper = mount(Input, { props: { label, description, error } })
    const words = wrapper.text().replace(label, '').replace(description, '').replace(error, '')

    expect(words.trim()).toBe('')
  })

  it('forwards platform attributes to the control, not the wrapper', () => {
    // The platform's input has dozens of attributes and a prop for each would
    // never be complete. What a project writes on the field belongs on the
    // control, which is where a placeholder actually renders.
    const wrapper = mount(Input, {
      props: { label },
      attrs: { placeholder: 'Add a name…', name: 'workspace', autocomplete: 'organization' },
    })
    const input = wrapper.get('input')

    expect(input.attributes('placeholder')).toBe('Add a name…')
    expect(input.attributes('name')).toBe('workspace')
    expect(input.attributes('autocomplete')).toBe('organization')
    expect(wrapper.attributes('placeholder')).toBeUndefined()
  })

  it('keeps class and style on the root, where layout lives', () => {
    const wrapper = mount(Input, { props: { label }, attrs: { class: 'mt-4' } })

    expect(wrapper.classes()).toContain('mt-4')
    expect(wrapper.get('input').classes()).not.toContain('mt-4')
  })

  it('fires a listener the project attaches to the control', async () => {
    const onBlur = vi.fn()
    const wrapper = mount(Input, { props: { label }, attrs: { onBlur } })

    await wrapper.get('input').trigger('blur')

    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})

describe('Select', () => {
  const options = `
    <option value="system">Follow the system</option>
    <option value="light">Always light</option>
  `

  it('renders a native select, so the platform owns the option list', () => {
    const wrapper = mount(Select, { props: { label }, slots: { default: options } })

    expect(wrapper.get('select').element.tagName).toBe('SELECT')
  })

  it('takes its options from the project', () => {
    const wrapper = mount(Select, { props: { label }, slots: { default: options } })

    expect(wrapper.findAll('option')).toHaveLength(2)
  })

  it('round-trips the selected value', async () => {
    const wrapper = mount(Select, {
      props: { label, modelValue: 'system' },
      slots: { default: options },
    })

    await wrapper.get('select').setValue('light')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['light'])
  })

  it('wears the same register as Input', () => {
    const wrapper = mount(Select, { props: { label }, slots: { default: options } })

    expect(wrapper.get('select').classes()).toContain('fds-control')
  })

  it('is named by its label', () => {
    const wrapper = mount(Select, {
      props: { label },
      slots: { default: options },
      attachTo: document.body,
    })

    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('select').attributes('id'))
  })

  it('reports invalid and points at the message when given an error', () => {
    const wrapper = mount(Select, {
      props: { label, error },
      slots: { default: options },
      attachTo: document.body,
    })
    const select = wrapper.get('select')

    expect(select.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find(`#${select.attributes('aria-describedby')}`).text()).toContain(error)
  })

  it('is inert when disabled', () => {
    const wrapper = mount(Select, {
      props: { label, disabled: true },
      slots: { default: options },
    })

    expect(wrapper.get('select').attributes('disabled')).toBeDefined()
  })

  it('forwards platform attributes to the control, not the wrapper', () => {
    const wrapper = mount(Select, {
      props: { label },
      attrs: { name: 'appearance', required: true },
      slots: { default: options },
    })

    expect(wrapper.get('select').attributes('name')).toBe('appearance')
    expect(wrapper.get('select').attributes('required')).toBeDefined()
    expect(wrapper.attributes('name')).toBeUndefined()
  })

  it('keeps class on the root and fires a listener on the control', async () => {
    const onBlur = vi.fn()
    const wrapper = mount(Select, {
      props: { label },
      attrs: { class: 'mt-4', onBlur },
      slots: { default: options },
    })

    await wrapper.get('select').trigger('blur')

    expect(wrapper.classes()).toContain('mt-4')
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
