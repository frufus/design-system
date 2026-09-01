## Context

See `proposal.md` — Why. What constrains the shape:

- The register in `registers.css` already owns the focus ring and the disabled
  token pair. A button that declares its own would be the first crack in the
  claim that the ring belongs to the system.
- The canvas fixes the visual side entirely: four variants, six states, heights
  36 / 44 / 52, radius 4, hover one step along the accent ramp and pressed two.
  Nothing here re-decides any of that.
- The package contains no user-facing strings, so every word is a slot.

**Everything below marked `[pattern]` is meant to be copied by the six primitives
that follow.** Where it is not marked, it is a decision local to Button.

## Goals / Non-Goals

**Goals:**

- A component whose states are readable from its source without running it.
- Behaviour under load that a keyboard user and a screen-reader user both
  survive.
- A shape the next six components can follow without re-deriving it.

**Non-Goals:**

- No variant beyond the four on the canvas. A fifth invented here would have no
  measured colours behind it.
- No control over the focus ring. It comes from the register or not at all.

## Decisions

### `[pattern]` Classes come from `Record<K, string>` maps in one file

`src/classMaps.ts` holds one map per axis — variant, size — and the component
indexes them. The maps are exported so a test can assert every documented value
has an entry, and so a reader can see the whole surface in one place.

_Alternative rejected:_ a `cva`-style helper or `clsx` with conditional objects.
Both are pleasant and both make the class strings computed. The project's rule is
that every class the build sees is greppable, and Tailwind's scanner enforces the
same thing from the other side: a class it cannot see literally is a class it
does not emit.

_Alternative rejected:_ one flat map keyed by `${variant}-${size}`. Twelve
entries instead of seven, and adding a size would mean editing four rows.

### `disabled` uses the attribute; `loading` uses `aria-disabled`

These are different states and they get different mechanisms.

`disabled` sets the real attribute. It is honest, it is what native semantics
mean, and a permanently unavailable control dropping out of the tab order is the
behaviour users expect.

`loading` sets `aria-disabled="true"` and `aria-busy="true"`, and the component
suppresses the emit. The button stays focusable, because losing focus mid-action
is worse than the alternative: a keyboard user who pressed Enter would find their
focus back at the top of the document while the action they started is still
running.

_Alternative rejected:_ `disabled` for both. Simpler, and it moves focus out from
under a user at the exact moment they are waiting for feedback.

_Alternative rejected:_ leaving `loading` activatable and letting the consumer
guard against double submission. That is the bug this state exists to prevent,
and every consumer would solve it again.

### `[pattern]` The label stays visible while loading

The spinner is added beside the label, never in place of it. The button's width
does not change mid-action, and a screen reader still reads what the control
does rather than announcing that something unnamed is busy.

### `type` defaults to `button`

A button inside a form that does not say otherwise submits it. That default has
caused enough accidental submissions to be worth reversing here; a project that
wants a submit button asks for one.

_Alternative rejected:_ following the platform default. Consistency with the
platform is worth less than not firing a form submission nobody asked for.

### `[pattern]` An unknown prop value falls back rather than failing

An out-of-range variant renders the default variant. A component that renders
unstyled in production because a value arrived from an API is worse than one that
renders plainly; TypeScript already prevents the case at the boundary that
matters.

### `[pattern]` The small size keeps a 44 px target

Height 36 is the visible box. The target is restored with a pseudo-element that
extends the hit area to 44, so density never costs the floor — the same trade the
row heights make in the layout.

## Risks / Trade-offs

- **The pattern propagates by imitation, not enforcement.** → Marked `[pattern]`
  above, so the next component copies decisions rather than guessing at them. The
  enforcement checks catch only the class-name rule.

- **`aria-disabled` without `disabled` means the button is still clickable in the
  DOM.** → The component suppresses the emit itself, and a test asserts no event
  escapes. Relying on the attribute alone would be a claim, not a guarantee.

- **Prop names become public surface on release.** → Same standing as the token
  names in ADR-0001: a rename is a breaking change. The names here are the ones
  the canvas already uses.
