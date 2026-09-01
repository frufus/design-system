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

      // Optional props here are typed `string | undefined` on purpose: absence
      // is the meaning. A default would claim a value where having none is the
      // point - an unset description is not an empty description, and the
      // difference decides whether an aria-describedby is emitted at all.
      'vue/require-default-prop': 'off',
    },
  },
)
