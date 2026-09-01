import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Combobox from '../src/components/Combobox.vue'

const label = 'Paint'
const options = [
  { value: 'mephiston', label: 'Mephiston Red' },
  { value: 'evil-sunz', label: 'Evil Sunz Scarlet' },
  { value: 'khorne', label: 'Khorne Red' },
]

function mountBox(props: Record<string, unknown> = {}) {
  return mount(Combobox, {
    props: { label, options, ...props },
    attachTo: document.body,
  })
}

const input = (wrapper: ReturnType<typeof mountBox>) => wrapper.get('input')
const optionEls = (wrapper: ReturnType<typeof mountBox>) => wrapper.findAll('[role="option"]')
const activeId = (wrapper: ReturnType<typeof mountBox>) =>
  input(wrapper).attributes('aria-activedescendant')

describe('Combobox filtering', () => {
  it('narrows to the matches and opens as soon as text is typed', async () => {
    const wrapper = mountBox()

    await input(wrapper).setValue('red')

    expect(input(wrapper).attributes('aria-expanded')).toBe('true')
    expect(optionEls(wrapper).map((o) => o.text())).toEqual(['Mephiston Red', 'Khorne Red'])
  })

  it('offers everything again when the text is cleared', async () => {
    const wrapper = mountBox()

    await input(wrapper).setValue('red')
    await input(wrapper).setValue('')

    expect(optionEls(wrapper)).toHaveLength(3)
  })

  it('stays open with nothing active when nothing matches', async () => {
    const wrapper = mountBox()

    await input(wrapper).setValue('ultramarine')

    expect(input(wrapper).attributes('aria-expanded')).toBe('true')
    expect(optionEls(wrapper)).toHaveLength(0)
    expect(activeId(wrapper)).toBeUndefined()
  })

  it('chooses nothing when Enter is pressed with no match', async () => {
    const wrapper = mountBox()

    await input(wrapper).setValue('ultramarine')
    await input(wrapper).trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('uses a matcher the project supplies', async () => {
    const wrapper = mountBox({
      matcher: (query: string, option: { value: string }) => option.value.startsWith(query),
    })

    await input(wrapper).setValue('kh')

    expect(optionEls(wrapper).map((o) => o.text())).toEqual(['Khorne Red'])
  })
})

describe('Combobox keyboard', () => {
  it('opens with the first option active when Down is pressed on a closed list', async () => {
    const wrapper = mountBox()

    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })

    expect(input(wrapper).attributes('aria-expanded')).toBe('true')
    expect(optionEls(wrapper)[0]?.attributes('id')).toBe(activeId(wrapper))
  })

  it('wraps to the first option after the last', async () => {
    const wrapper = mountBox()

    for (let i = 0; i < 4; i += 1) {
      await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    }

    expect(optionEls(wrapper)[0]?.attributes('id')).toBe(activeId(wrapper))
  })

  it('wraps to the last option before the first', async () => {
    const wrapper = mountBox()

    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await input(wrapper).trigger('keydown', { key: 'ArrowUp' })

    expect(optionEls(wrapper).at(-1)?.attributes('id')).toBe(activeId(wrapper))
  })

  it('jumps to the ends with Home and End', async () => {
    const wrapper = mountBox()

    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await input(wrapper).trigger('keydown', { key: 'End' })
    expect(optionEls(wrapper).at(-1)?.attributes('id')).toBe(activeId(wrapper))

    await input(wrapper).trigger('keydown', { key: 'Home' })
    expect(optionEls(wrapper)[0]?.attributes('id')).toBe(activeId(wrapper))
  })

  it('chooses the active option on Enter and shows it', async () => {
    const wrapper = mountBox()

    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await input(wrapper).trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['evil-sunz'])
    expect(input(wrapper).attributes('aria-expanded')).toBe('false')
    expect((input(wrapper).element as HTMLInputElement).value).toBe('Evil Sunz Scarlet')
  })

  it('closes on Escape and keeps the value', async () => {
    const wrapper = mountBox({ modelValue: 'khorne' })

    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await input(wrapper).trigger('keydown', { key: 'Escape' })

    expect(input(wrapper).attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('clears on a second Escape', async () => {
    const wrapper = mountBox({ modelValue: 'khorne' })

    await input(wrapper).trigger('keydown', { key: 'Escape' })
    await input(wrapper).trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])
    expect((input(wrapper).element as HTMLInputElement).value).toBe('')
  })

  it('closes and restores the chosen label when focus leaves', async () => {
    const wrapper = mountBox({ modelValue: 'khorne' })

    await input(wrapper).setValue('mephi')
    await input(wrapper).trigger('blur')

    expect(input(wrapper).attributes('aria-expanded')).toBe('false')
    expect((input(wrapper).element as HTMLInputElement).value).toBe('Khorne Red')
  })
})

describe('Combobox and assistive technology', () => {
  it('presents itself as a combobox over a listbox', async () => {
    const wrapper = mountBox()
    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })

    expect(input(wrapper).attributes('role')).toBe('combobox')
    expect(input(wrapper).attributes('aria-autocomplete')).toBe('list')
    expect(wrapper.get('[role="listbox"]')).toBeTruthy()
    expect(input(wrapper).attributes('aria-controls')).toBe(
      wrapper.get('[role="listbox"]').attributes('id'),
    )
  })

  it('names the active option by a reference that resolves, without moving focus', async () => {
    const wrapper = mountBox()

    // Focus the field first: the claim is that arrowing through the list does
    // not take focus away from it, which says nothing unless it had it.
    const element = input(wrapper).element as HTMLInputElement
    element.focus()
    expect(document.activeElement).toBe(element)

    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })

    const id = activeId(wrapper)
    expect(id).toBeTruthy()
    expect(wrapper.find(`#${id}`).exists()).toBe(true)
    expect(document.activeElement).toBe(element)
  })

  it('leaves no active reference when the list is closed', async () => {
    const wrapper = mountBox()

    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await input(wrapper).trigger('keydown', { key: 'Escape' })

    expect(activeId(wrapper)).toBeUndefined()
  })

  it('marks the chosen option with a check as well as a fill', async () => {
    const wrapper = mountBox({ modelValue: 'khorne' })
    await input(wrapper).trigger('keydown', { key: 'ArrowDown' })

    const chosen = optionEls(wrapper).find((o) => o.attributes('aria-selected') === 'true')

    expect(chosen, 'no option reports itself selected').toBeTruthy()
    expect(chosen?.find('[data-fds-chosen]').exists()).toBe(true)
  })

  it('reports the count in the words the project supplies', async () => {
    const wrapper = mount(Combobox, {
      props: { label, options },
      slots: { status: '<template #status="{ count }">{{ count }} Farben gefunden</template>' },
      attachTo: document.body,
    })

    await wrapper.get('input').setValue('red')

    const live = wrapper.get('[aria-live="polite"]')
    expect(live.text()).toBe('2 Farben gefunden')
  })

  it('keeps the live region empty when the project supplies no wording', async () => {
    const wrapper = mountBox()

    await input(wrapper).setValue('red')

    expect(wrapper.get('[aria-live="polite"]').text()).toBe('')
  })
})

describe('Combobox value integrity', () => {
  it('does not commit typed text that matches no option', async () => {
    const wrapper = mountBox({ modelValue: 'khorne' })

    await input(wrapper).setValue('ultramarine')
    await input(wrapper).trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect((input(wrapper).element as HTMLInputElement).value).toBe('Khorne Red')
  })

  it('shows empty text for a value that is not among the options', () => {
    // Inventing a label for it would be the component making up a word.
    const wrapper = mountBox({ modelValue: 'not-a-paint' })

    expect((input(wrapper).element as HTMLInputElement).value).toBe('')
  })

  it('shows the chosen label when a value is supplied', () => {
    const wrapper = mountBox({ modelValue: 'evil-sunz' })

    expect((input(wrapper).element as HTMLInputElement).value).toBe('Evil Sunz Scarlet')
  })
})
