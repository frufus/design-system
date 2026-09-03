import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import Dialog from '../src/components/Dialog.vue'

const title = 'Remove Mephiston Red from your shelf?'
const body = 'Results will stop preferring paints you already own.'
const closeLabel = 'Close'

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(Dialog, {
    props: { open: true, title, closeLabel, ...props },
    slots: { default: body },
    attachTo: document.body,
  })
}

/**
 * What these tests can and cannot reach.
 *
 * Trapping focus, making the page behind inert and restoring focus on close are
 * the browser's, which is the whole reason this component uses the platform's
 * dialog. A test DOM implements none of them, so asserting a focus trap here
 * would prove nothing while looking reassuring. What is asserted instead is that
 * the component *delegates* - that it opens through the modal mechanism rather
 * than around it - plus the parts it genuinely owns.
 */
describe('Dialog', () => {
  it('renders the platform element rather than a div wearing a role', () => {
    const wrapper = mountDialog()

    expect(wrapper.get('dialog').element.tagName).toBe('DIALOG')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('opens through the modal mechanism, not the open attribute', async () => {
    // The distinction is the entire point: `open` renders a dialog that traps
    // nothing and leaves the page behind reachable.
    const element = document.createElement('dialog')
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')

    const wrapper = mount(Dialog, {
      props: { open: false, title, closeLabel },
      slots: { default: body },
      attachTo: document.body,
    })
    await wrapper.setProps({ open: true })

    expect(showModal).toHaveBeenCalled()
    showModal.mockRestore()
    element.remove()
  })

  it('opens at mount when it is mounted open', () => {
    // A watcher that runs immediately runs before the element exists. A dialog
    // that is open from its first render has to open once the element is there.
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')

    mountDialog({ open: true })

    expect(showModal).toHaveBeenCalledTimes(1)
    showModal.mockRestore()
  })

  it('closes when the platform closes it', async () => {
    const wrapper = mountDialog()

    wrapper.get('dialog').element.dispatchEvent(new Event('close'))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  })

  it('reports a dismissal when the platform cancels, which is Escape', async () => {
    const wrapper = mountDialog()

    wrapper.get('dialog').element.dispatchEvent(new Event('cancel'))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('reports the same dismissal when the backdrop is activated', async () => {
    const wrapper = mountDialog()

    // A click whose target is the dialog itself landed on the backdrop: nothing
    // else is there to receive it - provided the pointer went down there too.
    await wrapper.get('dialog').trigger('pointerdown')
    await wrapper.get('dialog').trigger('click')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('stays open when the click lands inside the panel', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-fds-dialog-panel]').trigger('pointerdown')
    await wrapper.get('[data-fds-dialog-panel]').trigger('click')

    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })

  it('stays open when a drag that began in the panel ends on the backdrop', async () => {
    // Selecting text in the body and releasing outside fires a click on the
    // dialog element. That is a selection, not a dismissal.
    const wrapper = mountDialog()

    await wrapper.get('[data-fds-dialog-panel]').trigger('pointerdown')
    await wrapper.get('dialog').trigger('click')

    expect(wrapper.emitted('dismiss')).toBeUndefined()
  })

  it('reports one close when the close action is used', async () => {
    const wrapper = mountDialog()

    await wrapper.get('[data-fds-dialog-close]').trigger('click')

    expect(wrapper.emitted('dismiss')).toHaveLength(1)
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('names its close action with the label the project supplies, without painting it', () => {
    const wrapper = mountDialog()
    const close = wrapper.get('[data-fds-dialog-close]')

    expect(close.attributes('aria-label')).toBe(closeLabel)
    expect(close.text()).toBe('')
  })

  it('drops its description when the body slot is withdrawn', async () => {
    const show = ref(true)
    const Host = defineComponent({
      setup: () => () =>
        h(Dialog, { open: false, title, closeLabel }, show.value ? { default: () => body } : {}),
    })
    const wrapper = mount(Host)
    expect(wrapper.get('dialog').attributes('aria-describedby')).toBeTruthy()

    show.value = false
    await nextTick()

    expect(wrapper.get('dialog').attributes('aria-describedby')).toBeUndefined()
  })

  it('is named by its title', () => {
    const wrapper = mountDialog()
    const labelledBy = wrapper.get('dialog').attributes('aria-labelledby')

    expect(labelledBy).toBeTruthy()
    expect(wrapper.find(`#${labelledBy}`).text()).toBe(title)
  })

  it('is described by its body, and the reference resolves', () => {
    const wrapper = mountDialog()
    const describedBy = wrapper.get('dialog').attributes('aria-describedby')

    expect(describedBy).toBeTruthy()
    expect(wrapper.find(`#${describedBy}`).text()).toContain(body)
  })

  it('leaves no dangling description when there is no body', () => {
    const wrapper = mount(Dialog, {
      props: { open: true, title, closeLabel },
      attachTo: document.body,
    })

    expect(wrapper.get('dialog').attributes('aria-describedby')).toBeUndefined()
  })

  it('starts focus on the close action by default', () => {
    const wrapper = mountDialog()

    expect(wrapper.get('[data-fds-dialog-close]').attributes('autofocus')).toBeDefined()
  })

  it('yields the starting point when a project asks to place it', () => {
    const wrapper = mountDialog({ initialFocus: 'none' })

    expect(wrapper.get('[data-fds-dialog-close]').attributes('autofocus')).toBeUndefined()
  })

  it('refuses to open rather than pretending, when the platform cannot', async () => {
    // A fallback to the `open` attribute would look identical and trap nothing.
    //
    // The descriptor is saved and restored rather than the function value: that
    // puts the prototype back exactly as it was, enumerability included, and
    // avoids reading a method off a prototype as a bare value.
    const descriptor = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
    // @ts-expect-error - removing the method is the condition under test
    delete HTMLDialogElement.prototype.showModal

    try {
      const wrapper = mount(Dialog, {
        props: { open: false, title, closeLabel },
        slots: { default: body },
        attachTo: document.body,
      })

      await expect(wrapper.setProps({ open: true })).rejects.toThrow(/showModal/)
    } finally {
      if (descriptor) {
        Object.defineProperty(HTMLDialogElement.prototype, 'showModal', descriptor)
      }
    }
  })
})
