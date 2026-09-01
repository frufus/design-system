## Why

The design canvas under `docs/design/` is approved: Petrol on the Console
structure, with every colour pair measured rather than judged. Nothing in `src/`
exists yet, so the canvas is currently the only place the identity lives — a
picture no build can check. Until the tokens exist, every later task (Storybook,
Button, the fields, the consumer smoke test) has nothing to sit on.

## What Changes

- **New:** `src/tokens.css` — the raw `--fds-*` custom properties for colour,
  type, spacing, radius, control height and motion. Declared on `:root`, then
  overridden under both `prefers-color-scheme: dark` and `[data-theme="dark"]`,
  with `[data-theme="light"]` winning back in the other direction.
- **New:** `src/registers.css` — Tailwind's default theme nulled to `initial`,
  our tokens remapped onto utility names through `@theme inline`, and the shared
  control register in `@layer components`.
- **New:** a generator, `tools/build-tokens.mjs`, that emits the colour half of
  `tokens.css` from the same measured source the canvas was drawn from, so a
  swatch and the stylesheet cannot drift apart.
- **New:** tests that fail when the foundation is wrong rather than when someone
  notices — every mapped utility resolves to a variable, no Tailwind default
  colour survives the nulling, both appearances define the same token set, and
  every colour pair still meets its floor.
- The package exports `./tokens.css` and `./registers.css`, which the four-line
  consumer wiring in `openspec/config.yaml` already promises.

### Non-Goals

- **No components.** Button, Input, Select, Dialog, Card, Badge and EmptyState
  come later; this change ships no `.vue` file.
- **No Storybook.** The catalog is its own task and would otherwise decide token
  questions by what is convenient to preview.
- **No bundled font files.** `--fds-font-sans` names IBM Plex Sans and falls back
  to the system stack. Vendoring the `woff2` files is real work — licence file,
  subsetting, a fallback with matching metrics — and belongs in its own change.
  Until then the package renders in the fallback face, which is a visible gap and
  is recorded as one.
- **No theming API beyond redefinition.** A consumer retheming means redefining
  `--fds-*` values on `:root`. No JavaScript, no theme objects, no build step.

## Capabilities

### New Capabilities

- `design-tokens`: the token contract — what tokens exist, how the two
  appearances are selected, what a consumer may override, and the accessibility
  floors the values must meet.
- `tailwind-registers`: how Tailwind utilities resolve in a consuming project —
  the nulled default theme, the utility names our tokens claim, and the shared
  control register.

### Modified Capabilities

None. This is the project's first behaviour.

## Impact

- **New files:** `src/tokens.css`, `src/registers.css`, `tools/build-tokens.mjs`,
  and tests under `tests/`.
- **Consumers:** none yet. The `exports` map already points at both stylesheets,
  so this change makes an existing promise true rather than changing it.
- **Dependencies:** none added. Tailwind v4 is already a peer dependency and the
  tests read the CSS as text rather than running a Tailwind build.
- **Risk:** the token *names* are the package's public surface. Renaming one
  after a consuming project exists is a breaking change, so the naming is settled
  here and recorded as an ADR.
