import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FieldShell from '../src/components/FieldShell.vue'

const label = 'Workspace name'
const description = 'Everyone you invite sees this name.'
const error = 'Needs at least two characters.'

/** Mounts the shell with a probe control, as both real fields will use it. */
function mountShell(props: Record<string, unknown> = {}) {
  return mount(FieldShell, {
    props: { label, ...props },
    slots: {
      default: `<template #default="{ controlId, describedBy, invalid }">
        <input :id="controlId" :aria-describedby="describedBy" :aria-invalid="invalid" />
      </template>`,
    },
    attachTo: document.body,
  })
}

/** Every id in an aria-describedby has to name an element that is really there. */
function resolveReferences(root: Element, describedBy: string | undefined): Element[] {
  if (!describedBy) return []
  return describedBy
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => {
      const found = root.querySelector(`#${CSS.escape(id)}`)
      if (!found) throw new Error(`aria-describedby points at #${id}, which is not rendered`)
      return found
    })
}

describe('FieldShell', () => {
  it('announces an error that appears after the field did', async () => {
    // An error that arrives on submit is read without moving focus only if the
    // live region existed before the error did.
    const wrapper = mountShell()
    const live = wrapper.get('[aria-live="polite"]')
    expect(live.text()).toBe('')

    await wrapper.setProps({ error })

    expect(wrapper.get('[aria-live="polite"]').text()).toContain(error)
  })

  it('points its label at the control', () => {
    const wrapper = mountShell()

    expect(wrapper.get('label').attributes('for')).toBe(wrapper.get('input').attributes('id'))
  })

  it('generates an identifier that two fields on a page never share', () => {
    // Two mounts would be two apps, and useId counts per app - which would make
    // this pass for the wrong reason. Two fields in one app is the real case.
    const page = mount(
      {
        components: { FieldShell },
        template: `
          <div>
            <FieldShell label="First">
              <template #default="{ controlId }"><input :id="controlId" /></template>
            </FieldShell>
            <FieldShell label="Second">
              <template #default="{ controlId }"><input :id="controlId" /></template>
            </FieldShell>
          </div>
        `,
      },
      { attachTo: document.body },
    )

    const ids = page.findAll('input').map((input) => input.attributes('id'))

    expect(ids).toHaveLength(2)
    expect(ids[0]).toBeTruthy()
    expect(ids[0]).not.toBe(ids[1])
  })

  it('uses the identifier a project supplies', () => {
    const wrapper = mountShell({ id: 'workspace-name' })

    expect(wrapper.get('input').attributes('id')).toBe('workspace-name')
  })

  it('references a description, and the reference resolves', () => {
    const wrapper = mountShell({ description })
    const describedBy = wrapper.get('input').attributes('aria-describedby')

    const referenced = resolveReferences(wrapper.element, describedBy)

    expect(referenced).toHaveLength(1)
    expect(referenced[0]?.textContent).toContain(description)
  })

  it('leaves no dangling reference when there is nothing to describe', () => {
    const wrapper = mountShell()

    expect(wrapper.get('input').attributes('aria-describedby')).toBeUndefined()
  })

  it('reports invalid and names the error first', () => {
    const wrapper = mountShell({ description, error })
    const input = wrapper.get('input')
    const describedBy = input.attributes('aria-describedby')

    expect(input.attributes('aria-invalid')).toBe('true')

    const referenced = resolveReferences(wrapper.element, describedBy)
    expect(referenced).toHaveLength(2)
    expect(referenced[0]?.textContent).toContain(error)
    expect(referenced[1]?.textContent).toContain(description)
  })

  it('keeps the description visible when an error appears', () => {
    const wrapper = mountShell({ description, error })

    expect(wrapper.text()).toContain(description)
    expect(wrapper.text()).toContain(error)
  })

  it('gives the error an icon, so the state is not colour alone', () => {
    const wrapper = mountShell({ error })
    const icon = wrapper.find('[data-fds-error-icon]')

    expect(icon.exists()).toBe(true)
    expect(icon.attributes('aria-hidden')).toBe('true')
  })

  it('is not invalid when there is no error', () => {
    const wrapper = mountShell({ description })

    expect(wrapper.get('input').attributes('aria-invalid')).toBeUndefined()
  })

  it('shows only the words the project supplied', () => {
    const wrapper = mountShell({ description, error })
    const words = wrapper.text().replace(label, '').replace(description, '').replace(error, '')

    expect(words.trim()).toBe('')
  })
})
