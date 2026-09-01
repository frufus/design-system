## Context

See `proposal.md` — Why. This change follows Button's `[pattern]` decisions
rather than restating them: explicit maps, a fallback for an unknown value, the
register owns the shape, and every word is a slot.

## Goals / Non-Goals

**Goals:**

- Three components a project reaches for instead of writing a div.
- An interactive card that a keyboard can actually use.
- Tones whose legibility is asserted, not assumed.

**Non-Goals:**

- No layout, no chip, no illustration slot. All named in the proposal.

## Decisions

### An interactive card renders a `button`, not a `div` with a handler

When `interactive` is set, the root element is a real button. That is what makes
it focusable, keyboard-activatable and announced as a control without the
component reimplementing any of it.

_Alternative rejected:_ a `div` with `role="button"`, `tabindex="0"` and a
keydown handler. It is the common shape and it has to reimplement Enter, Space,
the disabled state and the focus behaviour the platform already provides - each
of which is a place to get it subtly wrong.

_Consequence, stated rather than discovered:_ a button may not contain another
button or a link. A card with its own actions inside is therefore not
interactive as a whole; the project puts the actions in the footer and leaves
the card presentational. The stories show both, so the constraint is visible.

### Badge tones are a map, and the map is the whole surface

Six tones, six entries, each pairing a fill with the ink measured against it.
The status mark is `aria-hidden`: the text already names the status, and a second
announcement would only interrupt.

### Card strips are slots, not props

Header and footer are slots that render nothing when empty, so a card with only
a body is one element rather than three with two of them blank.

### EmptyState takes no illustration

Deliberately absent rather than merely unimplemented. The canvas's rule is that
empty states are statements; a slot for artwork is an invitation to break it.

## Risks / Trade-offs

- **The interactive card cannot contain interactive content.** → Inherent to
  using a real button, and the correct trade: nesting controls is invalid markup
  whatever the outer element is. Documented in the design and shown in the
  stories.

- **Six tones is a small palette.** → A project that needs a seventh is
  describing a status this system has no colour measured for. Adding one means
  adding measured tokens, which is the right amount of friction.
