<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-tag border border-transparent px-2 py-0.5',
      'font-mono text-key font-semibold uppercase tracking-key',
      badgeToneClasses[tone],
    ]"
  >
    <span v-if="mark" data-fds-mark aria-hidden="true" class="size-1.5 bg-current"></span>
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  BADGE_TONES,
  DEFAULT_BADGE_TONE,
  badgeToneClasses,
  resolveKey,
  type BadgeTone,
} from '../classMaps.ts'

/**
 * A short, static label. Not a chip: it has no affordance, because a badge you
 * can dismiss is a control with keyboard behaviour to get right.
 *
 * The word is the project's. The mark beside it is decoration - the text already
 * names the status, and a second announcement would only interrupt.
 */
const props = withDefaults(
  defineProps<{
    tone?: BadgeTone
    /** A square in the tone's ink, for a status rather than a category. */
    mark?: boolean
  }>(),
  { tone: DEFAULT_BADGE_TONE, mark: false },
)

const tone = computed(() => resolveKey(props.tone, BADGE_TONES, DEFAULT_BADGE_TONE))
</script>
