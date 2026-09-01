import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Badge from '../src/components/Badge.vue'
import Button from '../src/components/Button.vue'
import Card from '../src/components/Card.vue'
import EmptyState from '../src/components/EmptyState.vue'

const meta = {
  title: 'Primitives/Surfaces',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Badges: Story = {
  render: () => ({
    components: { Badge },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--fds-space-2)">
        <Badge>Draft</Badge>
        <Badge tone="accent">In review</Badge>
        <Badge tone="success" mark>Verified</Badge>
        <Badge tone="warning" mark>Stale</Badge>
        <Badge tone="danger" mark>Failed</Badge>
        <Badge tone="outline">Outline</Badge>
      </div>
    `,
  }),
}

/**
 * The two arrangements side by side, because the constraint between them is real
 * and worth seeing: an interactive card is a button, and a button may not
 * contain another button. A card with its own actions therefore keeps them in
 * the footer and stays presentational.
 */
export const Cards: Story = {
  render: () => ({
    components: { Badge, Button, Card },
    template: `
      <div style="display: grid; gap: var(--fds-space-6); max-inline-size: 30rem">
        <Card>
          <template #header>
            <span class="font-mono text-key uppercase tracking-key text-ink-muted">Workspace</span>
            <Badge tone="success" mark>Saved</Badge>
          </template>

          <p class="text-base text-ink">Everyone you invite sees this name.</p>

          <template #footer>
            <Button size="sm">Save changes</Button>
            <span class="font-mono text-code text-ink-subtle">v0.1.0</span>
          </template>
        </Card>

        <Card interactive @click="() => {}">
          <div style="display: flex; align-items: center; gap: var(--fds-space-3)">
            <span class="size-9 bg-danger"></span>
            <span>
              <span class="block text-base text-ink">Evil Sunz Scarlet</span>
              <span class="block font-mono text-code text-ink-muted">army painter · chart</span>
            </span>
          </div>
        </Card>
      </div>
    `,
  }),
}

export const Empty: Story = {
  render: () => ({
    components: { Button, EmptyState, Card },
    template: `
      <Card style="max-inline-size: 30rem">
        <EmptyState>
          <template #count>0 items</template>
          <template #title>Nothing on the shelf yet</template>
          Add the paints you own and every result will tell you what you can already use.
          <template #action><Button>Add a paint</Button></template>
        </EmptyState>
      </Card>
    `,
  }),
}

export const EmptyWithoutAction: Story = {
  name: 'Empty · nothing to offer',
  render: () => ({
    components: { EmptyState, Card },
    template: `
      <Card style="max-inline-size: 30rem">
        <EmptyState>
          <template #title>No results</template>
          Nothing matched that search. Try a shorter term.
        </EmptyState>
      </Card>
    `,
  }),
}
