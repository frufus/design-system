<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive && disabled ? true : undefined"
    :class="[cardBaseClasses, interactive ? cardInteractiveClasses : '']"
    @click="interactive && $emit('click', $event)"
  >
    <!-- Slot presence is read here, at render time. A computed over the slots
         object would be evaluated once, and a strip a project fills later would
         never appear. -->
    <component
      :is="strip"
      v-if="$slots['header']"
      data-fds-card-header
      class="flex items-center justify-between gap-2 border-b border-border px-3 py-2"
    >
      <slot name="header" />
    </component>

    <component :is="strip" class="block px-3 py-3">
      <slot />
    </component>

    <component
      :is="strip"
      v-if="$slots['footer']"
      data-fds-card-footer
      class="flex items-center justify-between gap-2 border-t border-border-strong bg-surface-sunken px-3 py-2"
    >
      <slot name="footer" />
    </component>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cardBaseClasses, cardInteractiveClasses } from '../classMaps'

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
 *
 * A button may not contain block elements either, so when the card acts its
 * strips are spans that lay out as blocks. The markup stays valid as well as
 * focusable.
 */
const props = withDefaults(
  defineProps<{
    interactive?: boolean
    disabled?: boolean
  }>(),
  { interactive: false, disabled: false },
)

defineEmits<{ click: [event: MouseEvent] }>()

const strip = computed(() => (props.interactive ? 'span' : 'div'))
</script>
