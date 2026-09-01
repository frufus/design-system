<template>
  <div class="flex flex-col items-center gap-3 px-6 py-10 text-center">
    <p
      v-if="hasCount"
      class="font-mono text-key font-medium uppercase tracking-key text-ink-subtle"
    >
      <slot name="count" />
    </p>

    <p class="text-xl font-light tracking-xl text-ink">
      <slot name="title" />
    </p>

    <p class="max-w-80 text-sm text-ink-muted">
      <slot />
    </p>

    <div v-if="hasAction" data-fds-empty-action class="pt-1">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

/**
 * A statement, not an illustration.
 *
 * There is deliberately no slot for artwork. The identity's rule is that an
 * empty state says what is missing and offers the one action that fixes it; a
 * slot for a drawing is an invitation to break exactly that.
 *
 * Every word - the count, the title, the explanation, the action - belongs to
 * the consuming project.
 */
const slots = useSlots()

const hasCount = computed(() => Boolean(slots['count']))
const hasAction = computed(() => Boolean(slots['action']))
</script>
