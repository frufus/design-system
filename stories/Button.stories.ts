import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Button from '../src/components/Button.vue'

/**
 * The matrix from the approved canvas. Hover, active and focus are real states
 * rather than rendered stand-ins: a story that painted them would drift from
 * what the register actually does the moment the register changed.
 */
const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => ({
    components: { Button },
    setup: () => ({ args }),
    template: '<Button v-bind="args">Save changes</Button>',
  }),
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Destructive: Story = { args: { variant: 'destructive' } }

export const Disabled: Story = {
  args: { disabled: true },
}

export const Loading: Story = {
  args: { loading: true },
  parameters: {
    docs: {
      description: {
        story:
          'The label stays. The spinner is added beside it, so the button does not ' +
          'change width mid-action and a screen reader still reads what the control does.',
      },
    },
  },
}

/** Every variant against every state, which is how a regression shows itself. */
export const Matrix: Story = {
  render: () => ({
    components: { Button },
    setup: () => ({
      variants: ['primary', 'secondary', 'ghost', 'destructive'] as const,
    }),
    template: `
      <div style="display: grid; grid-template-columns: auto repeat(3, max-content); gap: var(--fds-space-3) var(--fds-space-4); align-items: center">
        <span></span>
        <span class="text-key font-mono uppercase text-ink-subtle">rest</span>
        <span class="text-key font-mono uppercase text-ink-subtle">disabled</span>
        <span class="text-key font-mono uppercase text-ink-subtle">loading</span>

        <template v-for="variant in variants" :key="variant">
          <span class="text-sm text-ink">{{ variant }}</span>
          <Button :variant="variant">Save changes</Button>
          <Button :variant="variant" disabled>Save changes</Button>
          <Button :variant="variant" loading>Save changes</Button>
        </template>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { Button },
    template: `
      <div style="display: flex; align-items: center; gap: var(--fds-space-3)">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    `,
  }),
}

/**
 * The glyph is decoration; the name comes from the consuming project. A button
 * whose only content is an icon and whose only name is that icon is a button no
 * screen reader can describe.
 */
export const IconOnly: Story = {
  render: () => ({
    components: { Button },
    template: `
      <Button variant="secondary" aria-label="Open the menu" class="w-11 px-0">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M4 6h12M4 10h12M4 14h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
      </Button>
    `,
  }),
}
