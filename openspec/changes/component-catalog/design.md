## Context

See `proposal.md` — Why. The constraints that shape the approach:

- Tailwind v4 is CSS-first here, and it does not scan `node_modules` for class
  names. The catalog runs *inside* the package rather than beside it, so its
  `@source` must point at `src/` directly — which makes it a rehearsal of the
  consumer wiring rather than a copy of it.
- The identity has no shadows and two appearances of equal rank. A catalog that
  can only show one appearance would let half the design go unlooked-at.
- `src/tokens.css` selects the dark appearance from `prefers-color-scheme`
  *unless* `data-theme` says otherwise. That is the hook the toolbar control
  needs, and it already exists.

## Goals / Non-Goals

**Goals:**

- Every story inspectable in both appearances, switched without a reload.
- Accessibility reported at the component while it is being written, not
  discovered later.
- The four-line consumer wiring exercised for real.

**Non-Goals:**

- No component of any kind, and no documentation pages. Both are named in the
  proposal.
- No decision here about how stories will be structured for the primitives. That
  belongs with the first primitive, which sets the pattern.

## Decisions

### The toolbar sets `data-theme`, and the story never knows

A global type in `preview.ts` writes `data-theme` onto the preview document's
root element. Stories render exactly what a consuming application would render;
none of them takes an appearance prop, and none branches on one.

*Alternative rejected:* a decorator that wraps each story in a themed container.
It would work, and it would quietly permit a component to receive its appearance
as data — which is the habit this package exists to remove. Setting the attribute
on the root keeps the mechanism identical to production.

*Alternative rejected:* rendering both appearances side by side in every story.
Useful for a design review, wrong for a catalog: it halves the space a component
gets and makes the a11y addon check a page rather than a component.

### The preview stylesheet is the consumer wiring, not a copy of it

`.storybook/preview.css` contains the same four lines the documentation gives a
consuming project, with the `@source` path adjusted for running inside the
package. If someone breaks the export map or moves a stylesheet, the catalog
stops rendering.

*Alternative rejected:* importing `src/tokens.css` and `src/registers.css`
directly by relative path and skipping Tailwind. Faster to set up, and it would
have hidden exactly the class of mistake this is here to catch.

### The first story is markup, not a component

One story renders a bare `input` carrying `.fds-control`. It exists to prove the
pipeline — Tailwind ran, the tokens resolved, the register applies, the addon
reports — before any component exists to confuse a failure with.

## Risks / Trade-offs

- **Storybook's dependency tree is large and moves fast.** → It is
  development-only and cannot reach the published package, which stays at seven
  files. The alternative considered during planning, Histoire, is effectively
  unmaintained; a self-built workbench would have to reimplement the a11y panel,
  which is the specific thing being bought here.

- **The catalog's `@source` differs from a consumer's by one path segment.** →
  A real consumer install is still unproven until the smoke test in a later task.
  This narrows the gap rather than closing it, and the proposal says so.

- **An a11y addon reports; it does not enforce.** → It is a reporting surface for
  the person writing a component, not a gate. The gate is the Playwright axe pass
  over the built catalog, which arrives with the components it guards.
