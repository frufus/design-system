## Why

The tokens exist and are measured, but nothing renders them. Every later task —
Button, the fields, Card, Dialog — needs somewhere to be looked at in both
appearances while it is being built, and needs its accessibility checked at the
component rather than at the end. Building the primitives first and the place to
inspect them second would mean deciding token questions by what happens to look
right in a test runner.

This also settles a question the token change deliberately left open: whether the
four-line consumer wiring actually produces styled output. The catalog is the
first thing to consume the package the way a project would.

## What Changes

- **New:** a Storybook 9 catalog for Vue 3 and Vite, with `@storybook/addon-a11y`
  so contrast and ARIA are reported at the component while it is being written.
- **New:** a toolbar control that switches `data-theme` on the preview root, so
  every story is inspectable in both appearances without reloading.
- **New:** a preview stylesheet that wires the package exactly the way the
  documented four lines say a consuming project should — including the `@source`
  line, so a mistake there shows up here rather than in someone else's project.
- **New:** one story that exercises the control register, proving the pipeline
  end to end before any component exists to put in it.
- `npm run dev` starts the catalog; `npm run build:storybook` builds it.

### Non-Goals

- **No components.** This change ships no primitive. The single story renders
  bare markup carrying the register's class, which is the point: it proves the
  catalog and the wiring, not a component.
- **No visual regression testing.** Playwright against the built catalog belongs
  with the components it would guard, not here.
- **No published catalog.** Nothing is deployed. `storybook-static/` stays
  ignored.
- **No documentation pages.** MDX docs are worth having once there is something
  to document; writing them now would document intentions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

This change is tooling. It adds no behaviour a consuming project can observe:
the catalog is not published, not exported, and not part of the package's
`files`. The requirement it exercises — that switching `data-theme` repaints
without a rebuild — is already specified under `tailwind-registers`, and this
change builds the place to watch it happen rather than changing what happens.
Accordingly it sets `skip_specs: true` rather than inventing a requirement to
satisfy validation.

## Impact

- **New files:** `.storybook/` (config, preview, preview stylesheet) and one
  story under `stories/`.
- **New dependencies:** Storybook 9 and its Vue-Vite framework, plus
  `@storybook/addon-a11y`. All development-only; the published package is
  unaffected and stays at seven files.
- **Consumers:** none. Nothing in `src/` changes.
- **Risk:** Storybook is a heavy dependency with a large transitive tree. It
  earns that here because the package is consumed by other projects, which makes
  the catalog the documentation, and because its a11y addon is what turns "light
  and dark are equal rank" from a claim into something checked per component.
