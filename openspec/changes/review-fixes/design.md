## Context

The package's checks were built around its rules: colour comes from tokens,
class names are literal, components carry no stylesheet. Each of those is true.
What none of them asks is whether a literal class name, once Tailwind has run,
produces any CSS - or whether the CSS it produces survives the cascade against
the rest of the package. Three of the four large defects are exactly that gap.

## Decisions

### The inert state of an action lives in the utilities layer

`.fds-action` stays in `@layer components`, where a consumer can override any
property. Its `:disabled` / `[aria-disabled='true']` rule moves to a
`@layer utilities` block at the end of `registers.css`. The utilities layer is
where the variant colours already are, `registers.css` is imported after
Tailwind, and the selector is more specific than any single utility - so the
inert state wins by layer order, then source order, then specificity, without
`!important`.

**Rejected:** adding `disabled:` and `aria-disabled:` variants to every entry in
the class map. Four variants times two mechanisms times two properties, and the
hover rule would still race it inside Tailwind's own variant order.

**Rejected:** moving the variant colours into the register as named classes.
It would work, but it moves colour out of the one place the design language
says colour maps live.

### A type step carries all four facets through one utility

Tailwind v4 reads `--text-<step>--line-height`, `--text-<step>--letter-spacing`
and `--text-<step>--font-weight` from the theme when it emits `text-<step>`.
The register maps those three keys for every step, so `text-xl` means what the
artboard's scale row means. `leading-*`, `tracking-*` and the named `font-*`
still exist to depart from a step deliberately, and they still win, because
Tailwind emits the step's values through `var(--tw-leading, ...)` fallbacks.

Four named weight tokens are added: `--fds-weight-light`, `-regular`,
`-medium`, `-semibold`. They are the weights the artboards use where a step's
default is not wanted - a label at medium on the `sm` step, a light empty-state
title on the `xl` step. Adding a token is cheap under ADR-0001; the names
describe a role in the type system, not a number.

**Rejected:** deleting the dead `font-*` classes and living with each step's
default weight. The label would lose its weight against its value, which is
the one piece of hierarchy a field has.

### Fallthrough attributes go to the control; `class` and `style` stay on the root

Every field declares `inheritAttrs: false`, splits `$attrs` at render time and
binds the remainder to its control. `class` and `style` are the two attributes
a consumer uses to place a field in a layout; everything else is about the
control. The split is a function, not a computed: `attrs` is not reactive, and
a computed over it would cache the first render.

**Rejected:** exposing `placeholder`, `name`, `autocomplete` and the rest as
props. The platform's input has dozens of attributes and the list would never
be complete.

### Slot presence is read at render time

`useSlots()` returns an object Vue updates in place; a `computed` over it is
evaluated once and cached forever. The three components that branch on a slot
read `$slots` in the template instead, which Vue re-evaluates on every render.

### The dialog's close action is named through a prop

A slot for the accessible name made "no name" the default outcome. A required
`closeLabel` prop makes the component refuse to compile without one, in the
same spirit as throwing rather than opening an untrapped dialog. The word is
still the project's.

### The dialog closes itself and reports once

The close button and the backdrop call `close()` on the element and let the
platform's `close` event report `update:open`. Escape already worked this way.
A `pointerdown` inside the panel followed by a `click` on the dialog is a drag,
not a backdrop activation; the component remembers where the pointer went down.

### The focus ring is an outline

`outline` with `outline-offset` draws the same offset ring on ordinary surfaces,
is not clipped by an ancestor's `overflow`, and is kept by forced-colours mode,
which discards `box-shadow`. The `outline: none` that the box-shadow needed
goes with it.

### Placeholder text is `ink-muted`

`ink-subtle` on the sunken control surface is roughly 3.5:1 in light. WCAG
counts placeholder as text and exempts only disabled controls, so a 3:1 floor
was the wrong floor. `ink-muted` clears 4.5:1 on the surface the control
actually draws, and the pair table now names that surface. `ink-subtle` keeps
its role for text that is genuinely secondary and not a control's content.

### The compiled-class check

A test compiles `.storybook/preview.css` - the rehearsed consumer wiring -
through `@tailwindcss/node` and scans `src` with `@tailwindcss/oxide`, exactly
as the Vite plugin does. It then collects every class name a component or the
class maps wear and asserts each one produced a rule. It also asserts the
things the cascade decides: that the inert rule follows the hover rule, and
that a `text-<step>` rule carries the four facets.

**Rejected:** a Playwright screenshot suite. It would see everything, cost a
browser download in CI, and answer "does it look different" rather than "which
class is dead".

## Risks

- **Tailwind's Node API.** `compile` and `Scanner` are what `@tailwindcss/vite`
  is built on and are stable across 4.x, but they are not a documented public
  contract. A break shows up as a failing test with the import at the top, not
  as a silent pass.
- **Test DOM fidelity.** `scrollIntoView` and `close()` on a dialog are
  exercised through spies and dispatched events where the DOM implementation
  is thin; the assertions are about delegation, as the dialog tests already
  are.
