<script setup lang="ts">
import FieldShell from './FieldShell.vue'

/**
 * A text input on the control register.
 *
 * The component owns no words: the label, the description and the error all
 * arrive from the consuming project, and so does any validation that decides
 * whether the error is there.
 */
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
</script>

<template>
  <FieldShell :label="label" :description="description" :error="error" :id="id">
    <template #default="{ controlId, describedBy, invalid }">
      <input
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
