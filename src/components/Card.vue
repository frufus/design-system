<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive && disabled ? true : undefined"
    :class="rootClasses"
    @click="interactive && $emit('click', $event)"
  >
    <div
      v-if="hasHeader"
      data-fds-card-header
      class="flex items-center justify-between gap-2 border-b border-border px-3 py-2"
    >
      <slot name="header" />
    </div>

    <div class="px-3 py-3">
      <slot />
    </div>

    <div
      v-if="hasFooter"
      data-fds-card-footer
      class="flex items-center justify-between gap-2 border-t border-border-strong bg-surface-sunken px-3 py-2"
    >
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

/**
 * The Console panel: a sharp rectangle with optional header and footer strips.
 *
 * When `interactive` is set the root is a real `button`. Not a div with a role
 * and a tabindex and a keydown handler - the platform already implements Enter,
 * Space, focus and the disabled state, and each of those is a place a
 * hand-rolled version gets subtly wrong.
 *
 * The consequence is real and deliberate: a button may not contain another
 * button or a link, so a card with its own actions inside is not interactive as
 * a whole. Put the actions in the footer and leave the card presentational.
 */
const props = withDefaults(
  defineProps<{
    interactive?: boolean
    disabled?: boolean
  }>(),
  { interactive: false, disabled: false },
)

defineEmits<{ click: [event: MouseEvent] }>()

const slots = useSlots()

const hasHeader = computed(() => Boolean(slots['header']))
const hasFooter = computed(() => Boolean(slots['footer']))

/**
 * Depth is a fill and an edge, never a shadow: a shadow is invisible on a
 * near-black ground, so this identity never learns to depend on one.
 */
const rootClasses = computed(() => [
  'block w-full border border-border-strong bg-surface text-left text-ink',
  props.interactive
    ? 'fds-focus-ring cursor-pointer border-l-[3px] hover:border-l-accent hover:bg-surface-sunken'
    : '',
])
</script>
