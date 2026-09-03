<template>
  <div class="flex flex-col items-center gap-3 px-6 py-10 text-center">
    <!-- Slot presence is read at render time, so a count or an action a project
         supplies later still appears. -->
    <p v-if="$slots['count']" class="font-mono text-key uppercase text-ink-subtle">
      <slot name="count" />
    </p>

    <p class="text-xl font-light text-ink">
      <slot name="title" />
    </p>

    <p class="max-w-80 text-sm text-ink-muted">
      <slot />
    </p>

    <div v-if="$slots['action']" data-fds-empty-action class="pt-1">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * A statement, not an illustration.
 *
 * There is deliberately no slot for artwork. The identity's rule is that an
 * empty state says what is missing and offers the one action that fixes it; a
 * slot for a drawing is an invitation to break exactly that.
 *
 * Every word - the count, the title, the explanation, the action - belongs to
 * the consuming project.
 *
 * The title is the `xl` step at the light weight: large and quiet, so the gap
 * in scale between it and the key above is the whole hierarchy.
 */
</script>
