## Context

See `proposal.md` — Why. Button's `design.md` marks the decisions meant to be
copied; this change follows them rather than restating them: class maps hold only
what varies, an unknown prop value falls back, and the register owns the shape.

The control register already exists and is unused. Everything visual here is
already decided by it and by the canvas.

## Goals / Non-Goals

**Goals:**

- One wiring for label, description and error, shared by both controls.
- Identifier references that resolve, asserted rather than assumed.
- Nothing a project has to remember to add for a field to be accessible.

**Non-Goals:**

- No validation, no form, no further control types. All named in the proposal.

## Decisions

### Deviation: Select renders a native `<select>`

The canvas draws an open list — a panel of options with a checked row. That is a
custom listbox, and building one means owning roving focus, typeahead,
`aria-activedescendant`, touch behaviour and the scroll-into-view logic that
every hand-rolled version gets subtly wrong.

A native select gets all of it from the platform, including the behaviour mobile
users expect, at the cost of not matching the drawn open list: the option list is
the operating system's, not ours.

_Alternative rejected:_ a custom listbox now. It is the single largest
accessibility surface in the whole package, and shipping it as one item inside a
five-component change is how it would be got wrong.

The drawn open list is not discarded — it becomes the specification for a
`Combobox`, which is where a custom list actually earns its cost, because that is
the case a native select genuinely cannot serve. Recorded in the plan rather
than left as an unexplained difference between the canvas and the code.

### An internal shell, not an exported `Field`

`FieldShell` owns the label, the two messages and the identifiers. It is not
exported.

_Alternative rejected:_ exporting it so projects can wrap their own controls.
Tempting, and it would make the wiring a public contract before there is a second
control type to prove the shape is right. It can be exported later; it cannot be
un-exported.

### The error is referenced before the description

`aria-describedby` lists the error first. A screen reader reads the references in
order, and someone who has just failed a field should hear the problem before the
explanation of the field.

_Alternative rejected:_ replacing the description with the error while it is
present. It reads well and it removes information at exactly the moment the user
needs it most.

### Identifiers come from `useId`

Vue's `useId` is stable across server and client rendering, which a counter in
module scope is not. A project may still pass its own `id`.

## Risks / Trade-offs

- **The canvas and the shipped Select differ visibly.** → Named as a deviation
  here and carried into the plan as the Combobox that inherits the drawing.
  Silent divergence between a design handoff and its code is how a handoff stops
  being believed.

- **`aria-describedby` can point at nothing.** → An attribute that references a
  missing element announces nothing and raises nothing, which is the worst
  failure shape available. The tests resolve every reference against the rendered
  document rather than asserting the attribute is present.

- **A native select cannot show the canvas's checked row.** → Accepted. The
  option list belongs to the platform, and consistency with the operating system
  is worth more to the person using it than consistency with our drawing.
