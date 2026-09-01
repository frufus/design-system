import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * Bare markup, deliberately. This story exists to prove the pipeline - Tailwind
 * ran, the tokens resolved, the register applies, the accessibility addon
 * reports - before any component exists to confuse a failure with.
 *
 * It is also the first thing to consume the package the way a project would,
 * through the four-line wiring in `.storybook/preview.css`.
 */
const meta = {
  title: 'Foundations/Control register',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Rest: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--fds-space-2); max-inline-size: 22rem">
        <label for="probe-rest" class="text-sm font-medium text-ink">Workspace name</label>
        <input id="probe-rest" class="fds-control" value="Studio" />
        <p class="text-xs text-ink-muted">Everyone you invite sees this name.</p>
      </div>
    `,
  }),
}

export const Invalid: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--fds-space-2); max-inline-size: 22rem">
        <label for="probe-invalid" class="text-sm font-medium text-ink">Workspace name</label>
        <input
          id="probe-invalid"
          class="fds-control"
          value="S"
          aria-invalid="true"
          aria-describedby="probe-invalid-error"
        />
        <p id="probe-invalid-error" class="text-xs text-danger-ink">Needs at least two characters.</p>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--fds-space-2); max-inline-size: 22rem">
        <label for="probe-disabled" class="text-sm font-medium text-ink-muted">Workspace name</label>
        <input id="probe-disabled" class="fds-control" value="Studio" disabled />
      </div>
    `,
  }),
}
