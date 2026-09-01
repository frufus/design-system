## Why

Two things, both found by reading the code rather than by a test.

**The loading spinner does not spin.** The canvas animates it; the component
ships the same SVG with no animation attached. A loading indicator that does not
move is worse than none: it reads as a broken icon, and the state it exists to
communicate is communicated only by the button being unresponsive.

**Every component puts `<script>` before `<template>`.** The convention for this
codebase is the other way round — the markup is what a reader opens a component
for, and the setup block is how it got there.

## What Changes

- **Fixed:** the busy indicator rotates, and stops rotating under
  `prefers-reduced-motion`.
- **Changed:** all eight components put `<template>` first.
- **New:** a fifth convention check, `template-before-script`, so the ordering
  holds without anyone remembering it.
- **Changed:** `docs/DESIGN-LANGUAGE.md` gains both rules.

**User-visible outcome:** a button that is working looks like it is working.

### Non-Goals

- **No new motion anywhere else.** The one animation this package has is the one
  it already claimed to have.
- **No lint rule bought from a plugin.** The check is four lines and reports in
  the same shape as the other four.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. The button's specified behaviour is unchanged: it already had to keep its
label, report itself busy and refuse a second activation. What was missing was
the animation the design called for, which no requirement described — and adding
a requirement now would be inventing one to justify a fix.

## Impact

- **Changed files:** eight components, the conventions runner, the design
  language.
- **Consumers:** none. No prop, no export and no class name changes.
- **Risk:** none identified. The reordering is mechanical and the suite covers
  every component it touches.
