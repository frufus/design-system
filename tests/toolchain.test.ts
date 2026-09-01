import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

// Proves the scaffold itself works: Vue SFC compilation, the DOM environment
// and the test runner agree. Every later suite depends on this holding.
describe('toolchain', () => {
  it('mounts a Vue component into a DOM', () => {
    const Probe = defineComponent({
      setup: () => () => h('button', { type: 'button' }, 'probe'),
    })

    const wrapper = mount(Probe)

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.text()).toBe('probe')
  })
})
