<template>
  <FieldShell
    v-bind="splitFieldAttrs(attrs).root"
    :id="id"
    :label="label"
    :description="description"
    :error="error"
  >
    <template #default="{ controlId, describedBy, invalid }">
      <div class="relative">
        <input
          v-bind="splitFieldAttrs(attrs).control"
          :id="controlId"
          role="combobox"
          type="text"
          autocomplete="off"
          aria-autocomplete="list"
          :aria-expanded="open ? 'true' : 'false'"
          :aria-controls="listId"
          :aria-activedescendant="activeId"
          :aria-describedby="describedBy"
          :aria-invalid="invalid"
          :disabled="disabled || undefined"
          :placeholder="placeholder"
          :value="query"
          class="fds-control pr-10"
          @input="onInput"
          @keydown="onKeydown"
          @click="onClick"
          @blur="onBlur"
        />

        <svg
          aria-hidden="true"
          focusable="false"
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
        >
          <path
            d="M6 8.5 10 12.5l4-4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <!-- The open list the canvas drew, at last. A pointer going down
             anywhere on it - the scrollbar included - must not take focus
             from the field, or the list closes under the drag. -->
        <div
          v-if="open"
          :id="listId"
          ref="listbox"
          role="listbox"
          :aria-label="label"
          class="absolute z-10 mt-1 max-h-64 w-full overflow-auto border border-border-strong bg-surface"
          @mousedown.prevent
        >
          <div
            v-for="(option, index) in matches"
            :id="optionId(index)"
            :key="option.value"
            role="option"
            :aria-selected="option.value === modelValue ? 'true' : 'false'"
            :class="[
              'flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-base',
              // One fill at a time. Active wins, because it is the state that
              // moves; the check below still says which option is chosen.
              index === activeIndex
                ? 'bg-surface-sunken'
                : option.value === modelValue
                  ? 'bg-accent-soft'
                  : '',
              option.value === modelValue ? 'font-medium text-accent-ink' : 'text-ink',
            ]"
            @mousedown.prevent="choose(option)"
            @mousemove="activeIndex = index"
          >
            <span>{{ option.label }}</span>

            <!-- A check as well as a fill: the choice must survive greyscale. -->
            <svg
              v-if="option.value === modelValue"
              data-fds-chosen
              aria-hidden="true"
              focusable="false"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="m3.5 8.4 3 3 6-6.8"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div v-if="matches.length === 0" class="px-3 py-3 text-sm text-ink-muted">
            <slot name="empty" />
          </div>
        </div>

        <!--
          The count, in the project's words. A bare number announced into the
          void helps nobody, so with no wording supplied this stays empty rather
          than inventing a language.
        -->
        <p aria-live="polite" class="sr-only">
          <slot v-if="open" name="status" :count="matches.length" />
        </p>
      </div>
    </template>
  </FieldShell>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue'
import FieldShell from './FieldShell.vue'
import { filterOptions, type ComboboxMatcher, type ComboboxOption } from '../comboboxFilter'
import { splitFieldAttrs } from '../fieldAttrs'

/**
 * A searchable single choice.
 *
 * This is the one component in the package that implements a pattern rather than
 * delegating it, and it says so: there is no platform primitive for a searchable
 * single choice. `<select>` cannot search, and `<datalist>` is a suggestion list
 * whose behaviour differs across engines and whose options cannot be marked as
 * chosen.
 *
 * For a short list of known values, `Select` is still the better answer.
 *
 * Focus never leaves the text field: the active option is named by reference
 * through `aria-activedescendant`. Roving focus would move focus out of the field
 * on the first arrow key and stop the typing this component exists for.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    label: string
    options: readonly ComboboxOption[]
    modelValue?: string | null
    description?: string | undefined
    error?: string | undefined
    id?: string | undefined
    placeholder?: string | undefined
    disabled?: boolean
    /** Replaceable, for data that needs accent folding or fuzzy matching. */
    matcher?: ComboboxMatcher | undefined
  }>(),
  { modelValue: null, disabled: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const attrs = useAttrs()

const uid = useId()
const listId = `fds-combobox-${uid}-list`
const optionId = (index: number) => `fds-combobox-${uid}-option-${index}`

const open = ref(false)
const activeIndex = ref(-1)

/** The option a value refers to, or nothing - never a label invented for it. */
const chosen = computed(() => props.options.find((option) => option.value === props.modelValue))

const query = ref(chosen.value?.label ?? '')

watch(chosen, (option) => {
  query.value = option?.label ?? ''
})

/** What the typed text matches, whether or not the list is showing it. */
const filtered = computed(() => filterOptions(props.options, query.value, props.matcher))

const matches = computed(() => (open.value ? filtered.value : []))

const activeId = computed(() =>
  open.value && activeIndex.value >= 0 && activeIndex.value < matches.value.length
    ? optionId(activeIndex.value)
    : undefined,
)

const listbox = ref<HTMLElement | null>(null)

/**
 * The list scrolls; focus does not move. So the browser will not bring the
 * active option into view on its own, the way it would for a focused element.
 * The option is found inside this component's own list rather than by id in
 * the document: the options are the list's children, in order.
 */
watch(
  activeId,
  () => {
    if (activeIndex.value < 0) return
    const option = listbox.value?.children.item(activeIndex.value)
    if (option instanceof HTMLElement) option.scrollIntoView({ block: 'nearest' })
  },
  { flush: 'post' },
)

function openList(active: number): void {
  open.value = true
  activeIndex.value = active
}

function closeList(): void {
  open.value = false
  activeIndex.value = -1
}

function choose(option: ComboboxOption): void {
  emit('update:modelValue', option.value)
  query.value = option.label
  closeList()
}

function onInput(event: Event): void {
  query.value = (event.target as HTMLInputElement).value
  open.value = true
  // Typing changes what is offered, so the previous position means nothing.
  activeIndex.value = -1
}

/** A pointer user reaches the list without typing or arrowing. */
function onClick(): void {
  if (!open.value && !props.disabled) openList(-1)
}

function move(delta: number): void {
  if (!open.value) {
    openList(0)
    return
  }
  const count = matches.value.length
  if (count === 0) return

  const next = activeIndex.value + delta
  activeIndex.value = ((next % count) + count) % count
}

function onKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break

    case 'ArrowUp':
      event.preventDefault()
      // The end of what the text matches, not of everything: with text in the
      // field the last option may not be on offer at all.
      if (!open.value) openList(Math.max(0, filtered.value.length - 1))
      else move(-1)
      break

    case 'Home':
      if (!open.value) return
      event.preventDefault()
      activeIndex.value = 0
      break

    case 'End':
      if (!open.value) return
      event.preventDefault()
      activeIndex.value = matches.value.length - 1
      break

    case 'Enter': {
      const option = matches.value[activeIndex.value]
      if (!open.value || !option) return
      event.preventDefault()
      choose(option)
      break
    }

    // Once to leave the list, twice to leave the choice - so both are reachable
    // without going for the mouse. With nothing to leave, the key is not ours:
    // a dialog around the field is waiting for it.
    case 'Escape':
      if (open.value) {
        event.preventDefault()
        closeList()
        return
      }
      if (query.value === '' && props.modelValue === null) return
      event.preventDefault()
      query.value = ''
      if (props.modelValue !== null) emit('update:modelValue', null)
      break

    default:
      break
  }
}

/**
 * Leaving restores rather than commits. Committing the typed text would produce
 * a value that is not one of the options, silently.
 */
function onBlur(): void {
  closeList()
  query.value = chosen.value?.label ?? ''
}
</script>
