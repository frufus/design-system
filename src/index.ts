// The public export surface of @frufus/design-system.
//
// Everything named here is API: a rename is a breaking change for every
// consuming project, on the same standing as the token names in ADR-0001.
// Nothing outside this file is part of the package's contract.

export { default as Button } from './components/Button.vue'

export { BUTTON_SIZES, BUTTON_VARIANTS, type ButtonSize, type ButtonVariant } from './classMaps.ts'
