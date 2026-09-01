<template>
  <div class="flex flex-col gap-1">
    <label :for="controlId" class="text-sm font-medium text-ink">{{ label }}</label>

    <slot :control-id="controlId" :described-by="describedBy" :invalid="invalid" />

    <p v-if="error" :id="errorId" class="flex items-center gap-1 text-xs text-danger-ink">
      <!-- The icon is what keeps the state from being colour alone. It is
           decoration: the message beside it already says what is wrong. -->
      <svg
        data-fds-error-icon
        aria-hidden="true"
        focusable="false"
        width="1em"
        height="1em"
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.6" />
        <path d="M8 4.8v3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
        <circle cx="8" cy="11.1" r="0.9" fill="currentColor" />
      </svg>
      {{ error }}
    </p>

    <!-- The description stays when an error appears. Removing it takes
         information away at exactly the moment it is most needed. -->
    <p v-if="description" :id="descriptionId" class="text-xs text-ink-muted">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

/**
 * The label, the two messages, and the identifiers connecting them.
 *
 * Internal on purpose: it is how Input and Select stay identical, not a
 * component a project composes with. Exporting it would make this wiring a
 * public contract before a second control type has proved the shape is right,
 * and a contract can be added later but never withdrawn.
 *
 * Every string here arrives from the consuming project. The component
 * contributes nothing to translate.
 */
const props = defineProps<{
  label: string
  // Explicitly `| undefined`: under exactOptionalPropertyTypes a parent that
  // forwards an absent prop is passing undefined, not omitting it, and the
  // signature should say which of those it accepts.
  description?: string | undefined
  error?: string | undefined
  id?: string | undefined
}>()

// useId is stable across server and client rendering, which a module-scope
// counter is not.
const generatedId = useId()

const controlId = computed(() => props.id ?? `fds-field-${generatedId}`)
const descriptionId = computed(() => `${controlId.value}-description`)
const errorId = computed(() => `${controlId.value}-error`)

const invalid = computed(() => (props.error ? true : undefined))

/**
 * The error comes first. A screen reader reads these in order, and someone who
 * has just failed a field should hear the problem before the explanation of the
 * field. An id is listed only when its element is actually rendered: a reference
 * to a missing element announces nothing and raises nothing.
 */
const describedBy = computed(() => {
  const ids = [props.error ? errorId.value : null, props.description ? descriptionId.value : null]
  const present = ids.filter((id): id is string => id !== null)
  return present.length > 0 ? present.join(' ') : undefined
})
</script>
