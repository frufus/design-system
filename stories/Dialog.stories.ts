import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Button from '../src/components/Button.vue'
import Dialog from '../src/components/Dialog.vue'

/**
 * Open these rather than reading them: the parts worth judging - focus landing
 * on close, Tab cycling inside, Escape leaving, focus returning to the trigger -
 * are the browser's behaviour and only exist when the dialog is really open.
 *
 * A dialog opened with `showModal` renders in the top layer, above every
 * stacking context on the page. That is correct and occasionally surprising:
 * it escapes a transformed or clipped ancestor rather than being trapped inside
 * one.
 */
const meta = {
  title: 'Primitives/Dialog',
  parameters: { layout: 'centered' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Confirm: Story = {
  render: () => ({
    components: { Button, Dialog },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <Button variant="destructive" @click="open = true">Remove from shelf</Button>

        <Dialog v-model:open="open" close-label="Close" title="Remove Mephiston Red from your shelf?">

          Results will stop preferring paints you already own. Your matches are not affected.

          <template #actions>
            <Button variant="secondary" @click="open = false">Keep it</Button>
            <Button variant="destructive" @click="open = false">Remove</Button>
          </template>
        </Dialog>
      </div>
    `,
  }),
}

export const TitleOnly: Story = {
  name: 'Title only, no body',
  render: () => ({
    components: { Button, Dialog },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <Button @click="open = true">Sign out</Button>

        <Dialog v-model:open="open" close-label="Close" title="Sign out of this workspace?">
          <template #actions>
            <Button variant="secondary" @click="open = false">Stay</Button>
            <Button @click="open = false">Sign out</Button>
          </template>
        </Dialog>
      </div>
    `,
  }),
}

/**
 * With `initial-focus="none"` the project places the starting point itself. The
 * default is the close action, deliberately: never the destructive one.
 */
export const PlacedFocus: Story = {
  name: 'The project places focus',
  render: () => ({
    components: { Button, Dialog },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <div>
        <Button @click="open = true">Rename workspace</Button>

        <Dialog v-model:open="open" close-label="Close" title="Rename workspace" initial-focus="none">

          <input class="fds-control" value="Studio" autofocus />

          <template #actions>
            <Button variant="secondary" @click="open = false">Cancel</Button>
            <Button @click="open = false">Rename</Button>
          </template>
        </Dialog>
      </div>
    `,
  }),
}
