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
relies on is computed from the shipped token values — 27 pairs, 54 assertions.

This is also why `border-strong` is darker than a soft system would draw it: an
input's border is its only affordance, so it carries the non-text floor rather
than a decorative one.

**Enforced by** the contrast suite in `tests/appearance.test.ts`.

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

Its duration comes from a motion token, so it stops with everything else under
`prefers-reduced-motion` rather than needing an opt-out of its own.

**Enforced by** the register suite in `tests/registers.test.ts`, which requires
the animation to exist and its duration to come from a token.

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

`Dialog` throws rather than opening a dialog that would trap nothing. An
`aria-describedby` is emitted only when its target is rendered. A check that
would cry wolf is dropped rather than kept.

**Not enforced by a check**, by nature. It is the reason several of the above
exist.

---

## Verifying

```
npm run test            # every assertion the package makes about itself,
                        #   including contrast and accessibility
npm run lint            # ESLint plus the five convention checks
npm run typecheck       # vue-tsc
npm run test:consumer   # packs, installs and builds against a real application
```

**`npm run test:consumer` is the one that matters most**, and the one easiest to
skip. Everything else verifies the package from inside itself. That command packs
the published contents, installs the tarball into a throwaway application, wires
it with the documented four lines and builds — which is the only way a broken
`files` list, a broken `exports` map or a wrong `@source` path is ever caught
here rather than in someone else's project.

It needs the network and takes a minute or two. Run it before releasing anything.
