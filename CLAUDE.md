# CLAUDE.md

`@frufus/design-system` is the shared Vue 3 + Tailwind v4 primitive library that
future projects install to get one accessible, themeable UI foundation.

**The binding project truth is `openspec/config.yaml`.** Product, non-negotiables,
tech stack and domain vocabulary live in its `context:` block. Current
requirements are the capability specs under `openspec/specs/`; anything under
`openspec/changes/` is proposed, not built.

## Commands

```
npm run test       # Vitest
npm run lint       # ESLint
npm run typecheck  # vue-tsc
npm run format     # Prettier
```

## Directories

```
src/               Tokens, registers, class maps and the primitives
docs/design/       .dc.html artboards - the binding visual handoff
docs/adr/          Architecture decisions
openspec/          Binding specs and change proposals
tests/             Unit and end-to-end tests
```
