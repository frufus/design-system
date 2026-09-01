import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Input from '../src/components/Input.vue'
import Select from '../src/components/Select.vue'

const label = 'Workspace name'
const description = 'Everyone you invite sees this name.'
const error = 'Needs at least two characters.'

const meta = {
  title: 'Primitives/Fields',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const frame = (inner: string) =>
  `<div style="display: flex; flex-direction: column; gap: var(--fds-space-6); max-inline-size: 24rem">${inner}</div>`

export const InputStates: Story = {
  name: 'Input · every state',
  render: () => ({
    components: { Input },
    setup: () => ({ label, description, error }),
    template: frame(`
      <Input :label="label" :description="description" model-value="Studio" />
      <Input :label="label" model-value="" placeholder="Add a name" />
      <Input :label="label" :description="description" :error="error" model-value="S" />
      <Input :label="label" model-value="Studio" disabled />
    `),
  }),
}

export const SelectStates: Story = {
  name: 'Select · every state',
  render: () => ({
    components: { Select },
    setup: () => ({ label: 'Appearance', description: 'Applies to this browser only.', error }),
    template: frame(`
      <Select :label="label" :description="description" model-value="system">
        <option value="system">Follow the system</option>
        <option value="light">Always light</option>
        <option value="dark">Always dark</option>
      </Select>
      <Select :label="label" :error="error" model-value="system">
        <option value="system">Follow the system</option>
      </Select>
      <Select :label="label" model-value="system" disabled>
        <option value="system">Follow the system</option>
      </Select>
    `),
  }),
}

/**
 * The two side by side, which is the assertion that matters: one register, one
 * height, one radius, one focus ring. A difference here is a bug in the
 * register, not in either component.
 */
export const OneRegister: Story = {
  name: 'One register, two controls',
  render: () => ({
    components: { Input, Select },
    template: frame(`
      <Input label="Workspace name" model-value="Studio" />
      <Select label="Appearance" model-value="system">
        <option value="system">Follow the system</option>
      </Select>
    `),
  }),
}
