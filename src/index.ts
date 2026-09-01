// The public export surface of @frufus/design-system.
//
// Everything named here is API: a rename is a breaking change for every
// consuming project, on the same standing as the token names in ADR-0001.
// Nothing outside this file is part of the package's contract.

export { default as Badge } from './components/Badge.vue'
export { default as Button } from './components/Button.vue'
export { default as Card } from './components/Card.vue'
export { default as Combobox } from './components/Combobox.vue'
export { default as Dialog } from './components/Dialog.vue'
export { default as EmptyState } from './components/EmptyState.vue'
export { default as Input } from './components/Input.vue'
export { default as Select } from './components/Select.vue'

export {
  BADGE_TONES,
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type BadgeTone,
  type ButtonSize,
  type ButtonVariant,
} from './classMaps.ts'

export {
  defaultMatcher,
  filterOptions,
  type ComboboxMatcher,
  type ComboboxOption,
} from './comboboxFilter.ts'
