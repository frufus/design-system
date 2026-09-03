<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || undefined"
    :aria-disabled="loading || undefined"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <!-- The indicator is decoration: the label already says what is happening,
         and a second announcement would only interrupt it. -->
    <svg
      v-if="loading"
      data-fds-busy
      class="fds-spin"
      aria-hidden="true"
      focusable="false"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-opacity="0.3" stroke-width="2" />
      <path
        d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>

    <!-- Every word belongs to the consuming project. -->
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  DEFAULT_BUTTON_SIZE,
  DEFAULT_BUTTON_VARIANT,
  buttonBaseClasses,
  buttonSizeClasses,
  buttonVariantClasses,
  resolveKey,
  type ButtonSize,
  type ButtonVariant,
} from '../classMaps'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    /** Permanently unavailable: leaves the tab order, as a native button does. */
    disabled?: boolean
    /** Temporarily working: stays focusable, cannot be activated twice. */
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: DEFAULT_BUTTON_VARIANT,
    size: DEFAULT_BUTTON_SIZE,
    disabled: false,
    loading: false,
    // A button inside a form that does not say otherwise submits it. That
    // default has caused enough accidental submissions to be worth reversing.
    type: 'button',
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const variant = computed(() => resolveKey(props.variant, BUTTON_VARIANTS, DEFAULT_BUTTON_VARIANT))
const size = computed(() => resolveKey(props.size, BUTTON_SIZES, DEFAULT_BUTTON_SIZE))

const classes = computed(() => [
  buttonBaseClasses,
  buttonVariantClasses[variant.value],
  buttonSizeClasses[size.value],
])

/**
 * `loading` cannot use the disabled attribute: a keyboard user who pressed Enter
 * would find their focus back at the top of the document while the action they
 * started is still running. So the button stays focusable and the component
 * refuses the activation itself - an attribute alone would be a claim, not a
 * guarantee.
 */
function onClick(event: MouseEvent): void {
  if (props.loading || props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>
