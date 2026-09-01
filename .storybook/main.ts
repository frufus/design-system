import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  // The package's stated posture is no analytics. A catalog that phones home
  // while documenting that rule would be an odd thing to ship.
  core: {
    disableTelemetry: true,
  },
  // Tailwind is not part of the repo's own Vite config - the package ships
  // source and lets the consumer compile it - so the catalog brings its own.
  async viteFinal(viteConfig) {
    const tailwind = (await import('@tailwindcss/vite')).default
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwind()]
    return viteConfig
  },
}

export default config
