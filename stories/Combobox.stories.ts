import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import Combobox from '../src/components/Combobox.vue'
import Select from '../src/components/Select.vue'

/**
 * Drive these from the keyboard rather than the mouse — that is where the
 * component either works or does not. Down opens, arrows wrap at both ends, Home
 * and End jump, Enter chooses, Escape leaves the list and a second Escape leaves
 * the choice. Focus stays in the text field throughout.
 */
const PAINTS = [
  { value: 'mephiston', label: 'Mephiston Red' },
  { value: 'evil-sunz', label: 'Evil Sunz Scarlet' },
  { value: 'khorne', label: 'Khorne Red' },
  { value: 'wazdakka', label: 'Wazdakka Red' },
  { value: 'word-bearers', label: 'Word Bearers Red' },
  { value: 'macragge', label: 'Macragge Blue' },
  { value: 'caledor', label: 'Caledor Sky' },
  { value: 'teclis', label: 'Teclis Blue' },
  { value: 'averland', label: 'Averland Sunset' },
  { value: 'yriel', label: 'Yriel Yellow' },
]

const meta = {
  title: 'Primitives/Combobox',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Searchable: Story = {
  render: () => ({
    components: { Combobox },
    setup() {
      const chosen = ref<string | null>('khorne')
      return { chosen, PAINTS }
    },
    template: `
      <div style="max-inline-size: 24rem">
        <Combobox
          v-model="chosen"
          label="Paint"
          :options="PAINTS"
          description="Type to narrow the list."
          placeholder="Search paints"
        >
          <template #status="{ count }">{{ count }} paints match</template>
          <template #empty>No paint matches that.</template>
        </Combobox>
      </div>
    `,
  }),
}

/**
 * The count is announced in the project's own words. With no wording supplied the
 * live region stays empty, rather than announcing a bare number into the void or
 * inventing an English sentence.
 */
export const WithoutWording: Story = {
  name: 'No wording supplied',
  render: () => ({
    components: { Combobox },
    setup() {
      const chosen = ref<string | null>(null)
      return { chosen, PAINTS }
    },
    template: `
      <div style="max-inline-size: 24rem">
        <Combobox v-model="chosen" label="Paint" :options="PAINTS" placeholder="Search paints" />
      </div>
    `,
  }),
}

export const CustomMatcher: Story = {
  name: 'A matcher the project supplies',
  render: () => ({
    components: { Combobox },
    setup() {
      const chosen = ref<string | null>(null)
      // Prefix matching, for data where a substring hit would be noise.
      const byPrefix = (query: string, option: { label: string }) =>
        option.label.toLowerCase().startsWith(query.trim().toLowerCase())
      return { chosen, PAINTS, byPrefix }
    },
    template: `
      <div style="max-inline-size: 24rem">
        <Combobox
          v-model="chosen"
          label="Paint"
          :options="PAINTS"
          :matcher="byPrefix"
          description="Matches from the start of the name only."
        >
          <template #status="{ count }">{{ count }} paints match</template>
          <template #empty>Nothing starts with that.</template>
        </Combobox>
      </div>
    `,
  }),
}

/**
 * The two side by side, because choosing between them is the actual decision. A
 * native select is better for a short list of known values: the platform's option
 * list, the behaviour a mobile user already knows, and nothing to get wrong.
 * Reach for the combobox when someone has to type to find the answer.
 */
export const BesideSelect: Story = {
  name: 'When to use which',
  render: () => ({
    components: { Combobox, Select },
    setup() {
      const paint = ref<string | null>(null)
      const appearance = ref('system')
      return { paint, appearance, PAINTS }
    },
    template: `
      <div style="display: grid; gap: var(--fds-space-6); max-inline-size: 24rem">
        <Select v-model="appearance" label="Appearance" description="Three known values - a native select.">
          <option value="system">Follow the system</option>
          <option value="light">Always light</option>
          <option value="dark">Always dark</option>
        </Select>

        <Combobox
          v-model="paint"
          label="Paint"
          :options="PAINTS"
          description="Hundreds of values - searchable."
          placeholder="Search paints"
        >
          <template #status="{ count }">{{ count }} paints match</template>
          <template #empty>No paint matches that.</template>
        </Combobox>
      </div>
    `,
  }),
}
