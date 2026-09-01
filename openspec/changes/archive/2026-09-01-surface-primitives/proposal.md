## Why

Three components remain that carry no behaviour: Card, Badge and EmptyState.
They are the ones a project is most tempted to rebuild by hand, because each
looks like "a div with some classes" — and that is exactly how the identity
erodes, one slightly different border at a time.

They arrive together because none of them is large enough to justify its own
change, and because two of them share a decision: how a tone becomes a colour.

## What Changes

- **New:** `src/components/Card.vue` — the Console panel: a sharp rectangle with
  optional header and footer strips and a body between them, plus an interactive
  form that gains an accent edge rather than a shadow.
- **New:** `src/components/Badge.vue` — six tones from an explicit map, each
  pairing a soft fill with its own ink, with an optional status square.
- **New:** `src/components/EmptyState.vue` — a count, a statement, an
  explanation and one action, all supplied by the project.
- **New:** stories and tests for all three.

**User-visible outcome:** a project can build the screen the canvas drew without
declaring a single border, radius or tone colour of its own.

### Non-Goals

- **No card grid or list layout.** Where cards sit is the consuming project's
  decision; a layout component here would be guessing at its screens.
- **No dismissible badge.** A badge with an affordance is a chip, and a chip is a
  control with keyboard behaviour to get right.
- **No illustration slot in EmptyState.** The canvas is explicit that empty
  states are statements, not illustrations, and a slot invites the mascot the
  rule exists to prevent.

## Capabilities

### New Capabilities

- `surfaces`: what the presentational primitives guarantee — that a tone is
  legible in both appearances, that an interactive card is reachable by
  keyboard, and that none of the three owns a word.

### Modified Capabilities

None.

## Impact

- **New files:** three components, their stories and tests.
- **Consumers:** three more exports, and the tone names become public surface.
- **Dependencies:** none added.
- **Risk:** an interactive card is the classic accessibility trap — a clickable
  `div` that no keyboard can reach. The spec requires it to be a real control,
  and the tests assert that rather than the appearance.
