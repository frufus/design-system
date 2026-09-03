<template>
  <FieldShell
    v-bind="splitFieldAttrs(attrs).root"
    :id="id"
    :label="label"
    :description="description"
    :error="error"
  >
    <template #default="{ controlId, describedBy, invalid }">
      <div class="relative flex items-center">
        <select
          v-bind="splitFieldAttrs(attrs).control"
          :id="controlId"
          :value="modelValue"
          :disabled="disabled || undefined"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
          class="fds-control appearance-none pr-10"
          @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        >
          <slot />
        </select>

        <!-- Decoration. The select already announces itself as a listbox, and a
             second announcement would only get in the way. -->
        <svg
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          class="pointer-events-none absolute right-3 text-ink-muted"
        >
          <path
            d="M6 8.5 10 12.5l4-4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </template>
  </FieldShell>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import FieldShell from './FieldShell.vue'
import { splitFieldAttrs } from '../fieldAttrs'

/**
 * A native select on the same register as Input.
 *
 * The canvas draws a custom open list; this renders the platform's. A custom
 * listbox means owning roving focus, typeahead, aria-activedescendant and the
 * scroll behaviour every hand-rolled version gets subtly wrong - and it would
 * replace the option list a mobile user already knows how to use. That case is
 * Combobox, which a native select genuinely cannot serve.
 *
 * Options come from the consuming project, so the component owns no words here
 * either. Attributes it does not declare go to the select; `class` and `style`
 * stay on the root.
 */
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    label: string
    modelValue?: string
    description?: string
    error?: string
    id?: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const attrs = useAttrs()
</script>
