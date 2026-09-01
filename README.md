# @frufus/design-system

A small set of Vue 3 primitives carried by one visual identity, so a new project
installs a single dependency and has a coherent, accessible, themeable interface
on its first commit.

Nine components. 97 design tokens. Two appearances of equal rank. No runtime
dependency beyond Vue itself.

---

## What this is

A **primitive layer**, and deliberately nothing more. Button, Input, Select,
Combobox, Dialog, Card, Badge, EmptyState — controls and surfaces that know
nothing about any application domain.

Its users are not end users. They are the projects that consume it and the
sessions that build them. A primitive that is awkward to consume has failed,
however good it looks in the catalog.

**What stays out:** feature panels, layout shells, data tables, and anything
that knows what an application is _about_. Those belong to the consuming
project. The [`component`](https://github.com/frufus/claude-standards) skill in
the companion standards repository exists to make that call before code is
written.

**What it never contains:** a user-facing string. Every word a person reads
arrives from the consuming project through a prop or a slot. There is nothing
here to translate, and adding something to translate is a design error.

## Why it exists

The alternative is every project restating the same values — a focus ring here,
a control height there, a slightly different disabled grey — and drifting apart
the moment two of them exist. Colour, shape and density are decided once, in one
place, measured against accessibility floors that are numbers rather than
intentions:

- **44 px** minimum touch target
- **4.5:1** text contrast, **3:1** non-text contrast — in _both_ appearances,
  asserted by tests against the shipped token values rather than judged by eye

---

## Install

```
npm install @frufus/design-system
```

Peer dependencies: Vue `^3.5`, Tailwind `^4.0`.

## Wire it up

Four CSS lines, and they are a contract — changing them is a breaking change
that requires an ADR:

```css
@import 'tailwindcss';
@source '../node_modules/@frufus/design-system/src';
@import '@frufus/design-system/tokens.css';
@import '@frufus/design-system/registers.css';
```

The `@source` line is not optional. Tailwind v4 skips `node_modules` during
content detection, so without it the package's own class names are never
generated and every component renders unstyled.

## Use it

```vue
<template>
  <Card>
    <Input v-model="email" label="Email" :error="error" />
    <Button variant="primary" :loading="saving" @click="save">Save</Button>
  </Card>
</template>

<script setup lang="ts">
import { Button, Card, Input } from '@frufus/design-system'
</script>
```

Everything importable is listed in [`src/index.ts`](src/index.ts). That file is
the package's entire contract: a rename there is a breaking change for every
consumer, on the same standing as a token rename.

| Component    | What it is                                     | Notable props                            |
| ------------ | ---------------------------------------------- | ---------------------------------------- |
| `Button`     | Action, with a busy state that stays focusable | `variant`, `size`, `disabled`, `loading` |
| `Input`      | Labelled text control                          | `label`, `description`, `error`          |
| `Select`     | Labelled native `<select>`                     | `label`, `description`, `error`          |
| `Combobox`   | Searchable single choice (ARIA pattern)        | `label`, `options`, `matcher`            |
| `Dialog`     | Modal on the platform `<dialog>` element       | `open`, `title`, `initialFocus`          |
| `Card`       | Surface; a real `<button>` when interactive    | `interactive`, `disabled`                |
| `Badge`      | Status or category tone                        | `tone`, `mark`                           |
| `EmptyState` | The nothing-here surface                       | slots only                               |

`Button` variants are `primary`, `secondary`, `ghost`, `destructive`; sizes
`sm`, `md`, `lg`. `Badge` tones are `neutral`, `accent`, `success`, `warning`,
`danger`, `outline`. All are exported as `const` arrays with matching types.

---

## Appearances and theming

Light and dark are **equal rank**, not a base and a variant. Both are declared
in full; light sits on the bare `:root` so a token can never exist only inside a
media query.

```html
<html data-theme="dark">
  <!-- omit the attribute and prefers-color-scheme decides -->
</html>
```

There is no `dark:` variant anywhere in this package, and there cannot be:
utilities map to the _variable_, not to its value, so flipping the attribute
repaints everything. For the same reason no component accepts a `theme`,
`appearance`, `mode` or `isDark` prop — a component that can be told which
appearance it is in has been handed the chance to branch on it, and a branch is
where two appearances start to drift.

**Retheming** means redefining `--fds-*` properties on your own `:root` after
the imports. No build step, no theme object, no JavaScript.

### Tokens

97 custom property names in total: 30 colour roles per appearance, plus shape,
typography, spacing and motion. Names describe the **role**, never the value or
the appearance — `--fds-ink`, not `--fds-near-black`; `--fds-surface-sunken`,
not `--fds-grey-50`. The reasoning, and the alternatives rejected, are in
[ADR-0001](docs/adr/0001-token-names-are-the-public-surface.md).

The colour half of `tokens.css` is generated from a measured palette
(`npm run build:tokens`) and committed. The test suite fails if the committed
file and a fresh generation disagree.

### Registers

Tailwind's default theme is **nulled, not extended** — a palette that is merely
extended leaves the defaults available, and available means eventually used. The
package then claims 74 utility names back and maps them onto its tokens, so what
you type stays clean: `bg-surface`, not `bg-fds-surface`.

A _register_ is a named set of control classes in `@layer components` — the
shared wiring that keeps Input, Select and Combobox exactly the same shape.

---

## The rules this package holds itself to

Full text, with the reasoning behind each, in
[`docs/DESIGN-LANGUAGE.md`](docs/DESIGN-LANGUAGE.md). In short:

- Every colour comes from a token. No hex, `rgb()` or `oklch()` outside
  `tokens.css`.
- Class names are literal. State maps to classes through explicit
  `Record<K, string>` tables, never assembled from a variable — Tailwind only
  emits names it has seen literally.
- Components carry no stylesheet. No `<style>` block, no `@apply`. Shared shape
  lives in a register.
- Components put their markup first: `<template>` before `<script setup>`.
- Depth is a surface, never a shadow. Shadows are invisible on a near-black
  ground, so `shadow-*` produces nothing at all.
- Three radii, and no more: `0` surfaces, `2` tags, `4` controls.
- **Use the platform before reimplementing it.** `Select` is a native
  `<select>`. An interactive `Card` is a real `<button>`. `Dialog` uses
  `showModal()` and inherits its focus trap, inert page, Escape handling and
  focus restoration.

That last rule has exactly one documented exception, and it says so: `Combobox`
implements the ARIA combobox pattern by hand, because no platform primitive
offers a searchable single choice. For a short list of known values, `Select` is
still the better answer.

Five of these are machine-enforced (`no-colour-literals`, `no-appearance-props`,
`no-composed-classes`, `no-style-blocks`, `template-before-script`). The rest are
enforced by the test suite or marked in the document as unenforced — because a
rule with no check, presented as if it had one, is how a design system ends up
with a document nobody believes.

---

## Verifying

```
npm run test          # 274 assertions across 21 files, contrast and a11y included
npm run lint          # ESLint plus the five convention checks
npm run typecheck     # vue-tsc, strict
npm run test:consumer # packs, installs and builds against a real application
```

**`test:consumer` is the one that matters most**, and the easiest to skip.
Everything else verifies the package from inside itself. That command packs the
published contents, installs the tarball into a throwaway app, wires it with the
four documented lines and builds — the only way a broken `files` list, a broken
`exports` map or a wrong `@source` path is caught here rather than in someone
else's project. It needs the network and takes a minute or two. Run it before
releasing anything.

## Working on it

```
npm run dev              # Storybook catalog, both appearances from the toolbar
npm run build:storybook
npm run build:tokens     # regenerate the colour half of tokens.css
npm run build:fonts      # re-vendor the subset woff2 (needs python + fonttools)
```

Both build steps are **authoring** steps whose output is committed. A consuming
project never runs them.

This repository follows the spec-driven standard in
[`claude-standards`](https://github.com/frufus/claude-standards): work begins as
a proposal under `openspec/changes/`, is approved before it is implemented, and
is archived when done. The binding project truth is
[`openspec/config.yaml`](openspec/config.yaml); current requirements are the
capability specs under `openspec/specs/`.

### Layout

```
src/                     Tokens, registers, vendored fonts, the primitives
src/index.ts             The public export surface — the whole contract
docs/design/             20 .dc.html artboards — the binding visual handoff
docs/DESIGN-LANGUAGE.md  The rules, and which check enforces each
docs/adr/                Architecture decisions
.storybook/              Catalog config: the consumer wiring, rehearsed
stories/                 Component stories
openspec/                Binding specs and change proposals
tests/                   Unit, contrast, accessibility and convention tests
tools/                   Authoring scripts: palette measurement, token and font builds
```

---

## Distribution

The package **ships source, not a bundle**. Components stay `.vue` SFCs compiled
by the consumer's Vite, because a pre-built bundle carries class names the
consumer's Tailwind never sees.

## Status and licence

Version 0.1.0. The primitive layer is complete and tested; the package is not
published to a public registry.

Code: UNLICENSED — see `package.json`. The bundled Atkinson Hyperlegible fonts
are SIL OFL 1.1 subsets; authorship, licence and the exact modifications are
recorded in [`NOTICE`](NOTICE). The package serves the font files from the
consuming project's own origin and contacts no font host.
