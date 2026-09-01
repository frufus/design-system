import { globalIgnores } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfigWithVueTs(
  globalIgnores(['dist/**', 'node_modules/**', 'storybook-static/**', 'coverage/**']),
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,
  skipFormatting,
  {
    rules: {
      // The package ships no strings of its own; a literal in a template is
      // almost always a user-facing string that belongs to the consumer.
      'vue/multi-word-component-names': 'off',
    },
  },
)
