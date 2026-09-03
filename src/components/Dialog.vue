<template>
  <dialog
    ref="dialog"
    :aria-labelledby="titleId"
    :aria-describedby="$slots['default'] ? bodyId : undefined"
    class="m-auto w-[min(28rem,calc(100vw-2rem))] border border-border-strong bg-surface p-0 text-ink backdrop:bg-ink/60"
    @cancel="onCancel"
    @close="onClose"
    @pointerdown="onPointerDown"
    @click="onClick"
  >
    <div data-fds-dialog-panel>
      <div
        class="flex items-center justify-between gap-3 border-b border-border-strong bg-surface-sunken px-3 py-2"
      >
        <h2 :id="titleId" class="text-lg text-ink">{{ title }}</h2>

        <!-- The accessible name comes from the project, like every other word.
             It is a required prop rather than a slot: a slot made "no name" the
             default outcome, silently. -->
        <button
          data-fds-dialog-close
          type="button"
          class="fds-focus-ring fds-target inline-flex size-8 items-center justify-center rounded-tag text-ink-muted hover:bg-surface"
          :aria-label="closeLabel"
          :autofocus="initialFocus === 'close' || undefined"
          @click="dismiss"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="m5.5 5.5 9 9m0-9-9 9"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div v-if="$slots['default']" :id="bodyId" class="px-4 py-4 text-base text-ink-muted">
        <slot />
      </div>

      <div
        v-if="$slots['actions']"
        class="flex items-center justify-end gap-2 border-t border-border-strong bg-surface-sunken px-3 py-2"
      >
        <slot name="actions" />
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'

/**
 * A modal dialog on the platform's own `dialog` element.
 *
 * `showModal()` gives the focus trap, the inert page behind, Escape, the top
 * layer and focus restoration - four of the five hard parts - the way the
 * browser and assistive technology already expect them. The shape most design
 * systems ship instead, a div with `role="dialog"` and a focus-trap library,
 * means owning the tab cycle, the inertness of everything behind, the restore on
 * close, and the interaction with find-in-page and autofill.
 *
 * Every word here is the consuming project's.
 */
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    /** The accessible name of the close action. Required: an unnamed icon
     *  button is a control no screen reader can describe. */
    closeLabel: string
    /**
     * Where focus starts. `close` is the safe default - never the destructive
     * action. `none` leaves the placement to the project's own autofocus.
     */
    initialFocus?: 'close' | 'none'
  }>(),
  { initialFocus: 'close' },
)

const emit = defineEmits<{
  'update:open': [open: boolean]
  /** Escape, the backdrop or the close action. All mean cancel; none means confirm. */
  dismiss: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)

const id = useId()
const titleId = computed(() => `fds-dialog-${id}-title`)
const bodyId = computed(() => `fds-dialog-${id}-body`)

/**
 * Makes the element agree with the prop. Called once the element exists and
 * again whenever the prop moves - not through an immediate watcher, whose first
 * run happens before mount, when there is no element to open.
 */
function sync(open: boolean): void {
  const element = dialog.value
  if (!element) return

  if (!open) {
    if (element.open) element.close()
    return
  }

  // No fallback to the `open` attribute on purpose: it renders something that
  // looks exactly like a modal, traps nothing, and leaves the page behind
  // reachable. A silent accessibility failure is worse than a loud one.
  if (typeof element.showModal !== 'function') {
    throw new TypeError(
      'Dialog needs the platform’s modal dialog: element.showModal is unavailable. ' +
        'Refusing to open a dialog that would not trap focus.',
    )
  }

  if (!element.open) element.showModal()
}

onMounted(() => sync(props.open))
watch(() => props.open, sync, { flush: 'post' })

/**
 * Every route out goes through the platform's `close()`, so the `close` event
 * is the one place `update:open` is reported - once per close, whichever way
 * it happened. Escape already worked like this; the button and the backdrop
 * now do too.
 */
function dismiss(): void {
  emit('dismiss')
  dialog.value?.close()
}

/** The platform's cancel is Escape. Let it close, and report the dismissal. */
function onCancel(): void {
  emit('dismiss')
}

function onClose(): void {
  emit('update:open', false)
}

/**
 * A click whose target is the dialog itself landed on the backdrop - nothing
 * else is there to receive it. But a pointer that went down inside the panel
 * and came up outside is a selection, and browsers deliver that as a click on
 * the common ancestor, which is the dialog. So the press is remembered, and
 * only a press that also began on the backdrop counts.
 */
const pressedOn = ref<EventTarget | null>(null)

function onPointerDown(event: PointerEvent): void {
  pressedOn.value = event.target
}

function onClick(event: MouseEvent): void {
  const element = dialog.value
  const press = pressedOn.value
  pressedOn.value = null
  if (event.target !== element || press !== element) return
  dismiss()
}
</script>
