## Why

Dialog is the last primitive and the one whose value is almost entirely
invisible. Everything a project can see — a panel, a title, two buttons — is
twenty minutes of work. What takes the time is the focus trap, the escape route,
the inert page behind and the focus that comes back to where it started, and
those are what every project reimplements slightly wrong.

## What Changes

- **New:** `src/components/Dialog.vue`, built on the platform's `dialog` element
  and `showModal()`, with `v-model:open`, a title, a body and an actions slot.
- **New:** tests that assert the component _delegates_ the modal behaviour rather
  than reimplementing it, plus the parts it does own: the backdrop dismissal, the
  identifiers, and what it emits.
- **New:** stories in both appearances, and axe over the dialog's markup.

**User-visible outcome:** a project gets a dialog whose keyboard behaviour is the
browser's, not an approximation of it.

### Non-Goals

- **No non-modal dialog, popover or drawer.** Each is a different behaviour, and
  a prop that switched between them would hide that.
- **No confirmation convenience wrapper.** A `confirm()`-shaped helper would need
  its own strings, and this package has none.
- **No focus-trap fallback.** If `showModal` is unavailable the component says so
  rather than silently rendering a non-modal dialog that looks identical and
  traps nothing.
- **No scroll locking of its own.** A modal dialog already makes the page inert.

## Capabilities

### New Capabilities

- `dialog`: what a modal guarantees — where focus goes, how it is left, what
  closing means, and that its behaviour is the platform's.

### Modified Capabilities

None.

## Impact

- **New files:** the component, its stories and tests.
- **Consumers:** one more export.
- **Dependencies:** none. Not needing a focus-trap library is the point.
- **Risk:** the parts that matter most — trapping, inertness, focus restoration —
  cannot be asserted in a test DOM, because they are the browser's behaviour.
  The tests assert delegation; the behaviour itself belongs to the end-to-end
  pass over the built catalog, which is a later task and is named as such rather
  than quietly assumed covered.
