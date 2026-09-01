import type { Preview } from '@storybook/vue3-vite'
import './preview.css'

/**
 * The appearance is set on the preview document's root element, exactly as a
 * consuming application would set it - not by wrapping the story. A decorator
 * that wrapped each story in a themed container would work, and would quietly
 * permit a component to receive its appearance as data, which is the habit this
 * package exists to remove.
 *
 * `system` removes the attribute rather than guessing, so the stylesheet's
 * prefers-color-scheme branch is what answers.
 */
type Appearance = 'system' | 'light' | 'dark'

function applyAppearance(appearance: Appearance): void {
  const root = document.documentElement
  if (appearance === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', appearance)
}

const preview: Preview = {
  globalTypes: {
    appearance: {
      description: 'Which appearance the preview renders in',
      toolbar: {
        title: 'Appearance',
        icon: 'contrast',
        items: [
          { value: 'system', title: 'Follow the system' },
          { value: 'light', title: 'Always light' },
          { value: 'dark', title: 'Always dark' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: {
    appearance: 'system',
  },

  decorators: [
    (story, context) => {
      applyAppearance((context.globals['appearance'] as Appearance) ?? 'system')
      return story()
    },
  ],

  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
  },
}

export default preview
