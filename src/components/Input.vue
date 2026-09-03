<template>
  <FieldShell
    v-bind="splitFieldAttrs(attrs).root"
    :id="id"
    :label="label"
    :description="description"
    :error="error"
  >
    <template #default="{ controlId, describedBy, invalid }">
      <input
        v-bind="splitFieldAttrs(attrs).control"
        :id="controlId"
        :type="type"
        :value="modelValue"
        :disabled="disabled || undefined"
        :aria-describedby="describedBy"
        :aria-invalid="invalid"
        class="fds-control"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </template>
  </FieldShell>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import FieldShell from './FieldShell.vue'
import { splitFieldAttrs } from '../fieldAttrs'

/**
 * A text input on the control register.
 *
 * The component owns no words: the label, the description and the error all
 * arrive from the consuming project, and so does any validation that decides
 * whether the error is there.
 *
 * Attributes the component does not declare go to the control, not the wrapper
 * - a placeholder written on the field has to reach the input to exist. `class`
 * and `style` stay on the root, where layout lives.
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
    /** Passed through, because an email field is the platform's job, not ours. */
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url'
  }>(),
  {
    disabled: false,
    type: 'text',
  },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const attrs = useAttrs()
</script>
