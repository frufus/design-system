# CLAUDE.md

`@frufus/design-system` is the shared Vue 3 + Tailwind v4 primitive library that
future projects install to get one accessible, themeable UI foundation.

**The binding project truth is `openspec/config.yaml`.** Product, non-negotiables,
tech stack and domain vocabulary live in its `context:` block. Current
requirements are the capability specs under `openspec/specs/`; anything under
`openspec/changes/` is proposed, not built.

## Commands

```
npm run dev          # Storybook catalog, both appearances from the toolbar
npm run build:storybook
npm run test         # Vitest
npm run test:consumer # packs, installs and builds against a real app - slow, and
                     #   the only check that catches a broken files or exports map
npm run lint         # ESLint plus the colour-literal check
npm run typecheck    # vue-tsc
npm run format       # Prettier
npm run build:tokens # regenerate the colour half of src/tokens.css
npm run build:fonts  # re-vendor the subset woff2 (needs python + fonttools)
```

Both build steps are authoring steps whose output is committed. A consuming
project never runs them, and the test suite fails if a committed file and a
fresh generation disagree.

## Directories

```
src/               Tokens, registers, vendored fonts and the primitives
docs/design/       .dc.html artboards - the binding visual handoff
docs/adr/          Architecture decisions
docs/DESIGN-LANGUAGE.md  The rules, and which check enforces each
.storybook/        Catalog config: the consumer wiring, rehearsed
stories/           Component stories
openspec/          Binding specs and change proposals
tests/             Unit and end-to-end tests
tools/             Authoring scripts: palette measurement, token and font builds
```
