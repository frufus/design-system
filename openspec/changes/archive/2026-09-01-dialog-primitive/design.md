## Context

See `proposal.md` — Why. This change follows Button's `[pattern]` decisions and
Card's: use the platform where the platform already does the work.

## Goals / Non-Goals

**Goals:**

- A dialog whose keyboard behaviour is the browser's.
- Honest tests: what a test DOM can assert, asserted; what it cannot, named.

**Non-Goals:**

- No drawer, popover, non-modal variant or confirmation wrapper. All in the
  proposal.

## Decisions

### The platform's `dialog` element and `showModal()`

`showModal()` gives the focus trap, the inert page, Escape, the top layer and
focus restoration - four of the five hard parts - and it gives them the way the
user's browser and assistive technology already expect.

_Alternative rejected:_ a `div` with `role="dialog"` and a focus-trap library.
That is the shape most design systems ship, and it means owning the tab cycle,
the inertness of everything behind, the restore on close, and the interaction
with browser find-in-page and autofill. Every one of those is a place to be
subtly wrong, and none of them is this package's contribution.

### No fallback when `showModal` is missing

If the method is unavailable the component throws rather than falling back to the
`open` attribute. That fallback would render something that looks exactly like a
modal, traps nothing, and leaves the page behind reachable - a silent
accessibility failure is worse than a loud one.

_Consequence:_ the component cannot be opened in a test DOM that lacks the
method. That is why the accessibility suite renders its markup rather than
opening it, and says so.

### The backdrop is detected by target, not by geometry

The panel is an inner element. A click whose target is the `dialog` itself landed
on the backdrop, because nothing else is there to receive it.

_Alternative rejected:_ comparing the pointer position against the panel's
bounding box. It has to account for padding, borders and a drag that starts
inside and ends outside - and it reports a dismissal for a text selection that
ends on the backdrop.

### Escape and the backdrop both mean cancel

Both emit the same dismissal. A dialog that treated one of its two exits as
confirmation would be a trap of a different kind.

### `autofocus` sits on the close action

The platform focuses the element carrying `autofocus`. Close is the safe default:
never the destructive action, which is what a project would otherwise reach for
by putting the primary button first. A project that wants a different starting
point sets `initial-focus="none"` and marks its own.

## Risks / Trade-offs

- **The important behaviour cannot be unit-tested.** → Trapping, inertness and
  restoration are the browser's, and a test DOM does not implement them. The
  tests assert that the component delegates - that it calls the modal mechanism -
  and the behaviour itself is named as belonging to the end-to-end pass over the
  built catalog. Asserting a focus trap against a DOM that has none would be a
  test that proves nothing while looking reassuring.

- **`::backdrop` cannot read a custom property in every engine's older
  versions.** → The backdrop colour is set on the element rather than relying on
  inheritance into the pseudo-element, which works everywhere current.

- **A dialog rendered inside a transformed ancestor escapes to the top layer.** →
  Correct behaviour, and occasionally surprising to someone expecting the panel
  to stay inside its container. Noted in the story.
