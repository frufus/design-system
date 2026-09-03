# Design language

The rules this package holds itself to, why each exists, and what enforces it.

A rule with no check is marked as such. Pretending otherwise is how a design
system ends up with a document nobody believes and a codebase nobody trusts.

---

## Colour

### Every colour comes from a token

There is no hex, no `rgb()`, no `oklch()` anywhere in the package except
`src/tokens.css`. A colour written into a component is a colour that cannot be
rethemed, cannot be measured, and will be subtly wrong in one of the two
appearances.

**Enforced by** `no-colour-literals`.

### The two appearances are equal rank

Both are declared in full. Light sits on the bare `:root` so a token can never
exist only inside a media query — the failure where a page loses its colours in
one appearance and nobody notices until a screenshot.

There is no `dark:` variant anywhere, and there cannot be: utilities map to the
variable, not to its value, so changing the attribute repaints everything.

**Enforced by** the appearance-parity suite in `tests/appearance.test.ts`.

### Appearance is set on the document, never handed to a component

No component takes a `theme`, `appearance`, `mode` or `isDark` prop. A component
that can be told which appearance it is in has been given the chance to branch on
it, and a branch is a place for the two appearances to drift apart.

**Enforced by** `no-appearance-props`.

### Contrast floors are measured, not judged

4.5:1 for text, 3:1 for non-text, in both appearances. Every pair the package
relies on is computed from the shipped token values — 30 pairs, 60 assertions.

This is also why `border-strong` is darker than a soft system would draw it: an
input's border is its only affordance, so it carries the non-text floor rather
than a decorative one.

Placeholder is text. WCAG exempts only disabled controls from the text floor,
so a placeholder wears `ink-muted` and is measured on `surface-sunken`, the
fill a control actually draws — not on `surface`, and not at 3:1. A pair a
component draws that the table does not name is a pair nobody measured; the
rule is to add it, not to assume it from a similar one.

**Enforced by** the contrast suite in `tests/appearance.test.ts`.

### The colour scheme follows the appearance

Native form chrome, the option popup of a select, and scrollbars follow
`color-scheme`, not the tokens. Without it the dark appearance opens a white
popup. It is declared by every route an appearance can be chosen — the bare
root, the system preference, and both explicit attributes.

**Enforced by** the colour-scheme suite in `tests/tokens-shape.test.ts`.

---

## Structure

### The row is the unit, not the box

Panels are sharp rectangles with strips. Density lives in the row rhythm — 40 px
for a display row, 52 px for a row holding a control — never in the control
itself.

**Not enforced.** It is a layout habit, and a check that tried to police it would
be guessing at intent.

### Depth is a surface, never a shadow

A shadow is invisible on a near-black ground, so nothing here learns to depend on
one. Recessed means a darker fill and a darker top edge; raised means a lighter
surface. Both read the same in either appearance.

No shadow scale is remapped after the Tailwind nulling, so `shadow-*` produces
nothing at all.

**Enforced by** the register suite in `tests/registers.test.ts`, which fails if a
shadow scale is reintroduced.

### The one animation is shared, and it obeys reduced motion

The package animates exactly one thing: the busy indicator on a working button.
It lives in the register as `.fds-spin`, not in the component, for the same
reason components carry no style block - a component declaring its own animation
is a component holding a value that is not a token, and that is how a system ends
up with six slightly different spinners.

Its duration comes from a motion token. That is not, on its own, what stops it
under `prefers-reduced-motion`: the collapsed duration that halts every
transition leaves an infinite animation sampling a different angle every frame,
which flickers. So the register sets the animation to `none` under reduced
motion, explicitly.

**Enforced by** the register suite in `tests/registers.test.ts`, which requires
the animation to exist, its duration to come from a token, and the reduced-motion
rule to stop it.

### The focus ring is an outline

The shared ring is `outline` with `outline-offset`, from the focus tokens, on
every control and action. Not a box-shadow: forced-colours mode keeps outlines
and discards shadows, and an outline is not clipped by an ancestor's overflow.
Nothing in the package sets `outline: none`.

**Enforced by** the ring suite in `tests/registers.test.ts`.

### The inert state wins

A button's variant colours are utilities, and the utilities layer beats the
components layer however specific the selector. So the one rule that has to
beat a variant colour and its hover — the disabled and busy state — lives in a
`@layer utilities` block at the end of `registers.css`, after Tailwind's own
output. Layer order, then source order, then specificity, and no `!important`.

**Enforced by** the inert suite in `tests/registers.test.ts`, and by the
compiled-class check below, which reads the order out of the compiled
stylesheet.

### A type step is one class

`text-<step>` carries the step's size, line height, tracking and default
weight, because the register maps all three companion keys Tailwind reads when
it emits the utility. A component departs from a step deliberately, with
`leading-*`, `tracking-*` or one of the four named weights — `light`,
`regular`, `medium`, `semibold` — which are tokens like everything else.

**Enforced by** `tests/registers.test.ts` and the compiled-class check.

### Three radii, and no more

`0` for surfaces, `2` for tags, `4` for controls. A rounded corner means _this
responds to you_, which only reads while the surfaces around it stay square.

**Enforced by** `tests/tokens-shape.test.ts`, which fails if a fourth appears.

### Every control keeps a 44 px target

The small size is a 36 px box inside a 44 px activation area. Density is free in
a row of text and never bought from the touch target.

**Enforced by** `tests/class-maps.test.ts` and `tests/button.test.ts`.

---

## Components

### A component owns no words

Every string a person reads arrives from the consuming project, through a prop or
a slot. There is nothing here to translate, and adding something to translate is
a design error.

**Not enforced by a check.** Asserted per component in the tests, which compare
the rendered text against exactly the words the test supplied.

### Class names are literal

State maps to classes through explicit `Record<K, string>` tables in
`src/classMaps.ts`. Nothing is assembled from a variable — Tailwind only emits
class names it has seen literally, so a composed name fails twice: it cannot be
found by searching, and it is never generated.

**Enforced by** `no-composed-classes`.

### Every class a component wears compiles

A literal class name is not the same as a class that exists. After the default
theme is nulled, a utility whose namespace was not remapped compiles to nothing,
silently — a component wore `font-medium` for a month and rendered at 400. So
the stylesheet is compiled the way a consumer's Tailwind compiles it, and every
class in a `class` or `:class` attribute or a class map has to produce a rule.

Class strings live in exactly those places — an attribute in a template, or an
export ending in `Classes` in `src/classMaps.ts` — so the check can find them.

**Enforced by** `tests/compiled-classes.test.ts`, which runs Tailwind's
compiler over the rehearsed consumer wiring.

### A field's attributes reach its control

`class` and `style` on a field are how it is placed in a layout, so they stay on
the root. Everything else a project writes on a field — `placeholder`, `name`,
`autocomplete`, `required`, a `blur` listener — is about the control, and a
placeholder that lands on the wrapper does not exist.

**Enforced by** the passthrough tests in `tests/fields.test.ts` and
`tests/combobox.test.ts`.

### Slot presence is read at render time

`useSlots()` returns an object Vue updates in place; a `computed` over it is
evaluated once and cached forever, so a strip a project fills after mount never
appears and a dialog keeps describing a body that is gone. A component that
branches on a slot reads `$slots` in its template.

**Enforced by** the after-mount tests in `tests/surfaces.test.ts` and
`tests/dialog.test.ts`.

### Components carry no stylesheet

No `<style>` block, scoped or otherwise, and no `@apply`. A style block is where a
component starts holding values that are not tokens; scoping only hides that it
has. Shared shape belongs in a register in `src/registers.css`.

**Enforced by** `no-style-blocks`.

### Components put their markup first

`<template>` comes before `<script setup>` in every component. The markup is what
a reader opens a component for; the setup block is how it got there.

**Enforced by** `template-before-script`.

### Use the platform before reimplementing it

Three components take this seriously, and it is the most consequential rule here:

- **Select** renders a native `<select>`. The canvas drew a custom open list; a
  custom listbox means owning roving focus, typeahead, `aria-activedescendant`
  and the scroll behaviour every hand-rolled version gets subtly wrong.
- **Card**, when interactive, renders a real `<button>` — not a div with a role,
  a tabindex and a keydown handler.
- **Dialog** uses the platform's `dialog` element and `showModal()`, which
  provides the focus trap, the inert page, Escape and focus restoration.

One component breaks this rule, and says so: **Combobox** implements the ARIA
combobox pattern by hand, because there is no platform primitive for a searchable
single choice — `<select>` cannot search, and `<datalist>` behaves differently in
every engine and cannot mark an option as chosen. It is alone in its change,
specified scenario by scenario, and tested the same way. For a short list of
known values, `Select` is still the better answer.

Where the platform cannot be used, say so and take on the whole cost. Where it
can, the component's job is to delegate, not to approximate.

**Not enforced by a check.** It is a design judgement, recorded in each
component's ADR-adjacent design notes and in the change that introduced it.

### A silent failure is worse than a loud one

`Dialog` throws rather than opening a dialog that would trap nothing, and takes
the name of its close action as a required prop rather than a slot, because a
slot made "no name" the default outcome. An `aria-describedby` is emitted only
when its target is rendered. A check that would cry wolf is dropped rather than
kept.

**Not enforced by a check**, by nature. It is the reason several of the above
exist.

---

## Verifying

```
npm run test            # every assertion the package makes about itself,
                        #   including contrast, accessibility and the
                        #   compiled-class check
npm run lint            # ESLint plus the five convention checks
npm run typecheck       # vue-tsc
npm run test:consumer   # packs, installs and builds against a real application
```

None of these looks at a rendered pixel. The compiled-class check is the closest
thing to it, and it is what makes the rest trustworthy: a green suite over dead
classes is how this document and the artboards disagreed with the browser for a
month. After a change to the registers or a component, open the catalog in both
appearances and look.

**`npm run test:consumer` is the one that matters most**, and the one easiest to
skip. Everything else verifies the package from inside itself. That command packs
the published contents, installs the tarball into a throwaway application, wires
it with the documented four lines and builds — which is the only way a broken
`files` list, a broken `exports` map or a wrong `@source` path is ever caught
here rather than in someone else's project.

It needs the network and takes a minute or two. Run it before releasing anything.
