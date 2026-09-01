## Why

Button proved the pattern; the control register has been sitting in
`registers.css` since the foundation with nothing using it. Input and Select are
where the accessibility work of this package actually lives — label association,
descriptions, error messages and the wiring between them are what a project gets
wrong when it builds a field by hand, and gets wrong the same way in every
project.

They arrive together because they are one thing: the same register, the same
label and message wiring, the same states. Building them apart would mean
building that wiring twice and letting it drift.

## What Changes

- **New:** an internal `FieldShell` that owns the label, the description, the
  error message and the identifiers connecting them. Not exported: it is how the
  two controls stay identical, not a component a project composes with.
- **New:** `src/components/Input.vue` — a text input on the control register,
  with `v-model`, a description, an error, and every state from the canvas.
- **New:** `src/components/Select.vue` — a native select on the same register,
  with the same wiring.
- **New:** stories for both, and the accessibility assertions the plan asks for:
  a11y passes with and without an error, in both appearances.

**User-visible outcome:** a project renders a labelled field whose message a
screen reader announces, without writing a single `aria-` attribute.

### Non-Goals

- **No custom listbox.** Select renders a native `<select>`. See the design for
  why, and for what the canvas's drawn open-list becomes instead.
- **No validation.** The component displays an error a project gives it and
  never decides whether a value is valid.
- **No textarea, checkbox, radio or switch.** Each is a real component with its
  own states; naming them here would be a promise this change does not keep.
- **No form component.** Layout and submission belong to the consuming project.

## Capabilities

### New Capabilities

- `form-field`: what a labelled control guarantees — that its label names it,
  that its description and error are announced, and what happens when both are
  present.

### Modified Capabilities

None. The control register already specifies the shared shape.

## Impact

- **New files:** two components, one internal shell, their stories and tests.
- **Consumers:** two more exports, and with them the prop names that become
  public surface on release.
- **Dependencies:** none added.
- **Risk:** the identifier wiring is the part that silently half-works — an
  `aria-describedby` pointing at an element that is not rendered announces
  nothing and raises nothing. The tests assert the reference resolves, not just
  that the attribute exists.
