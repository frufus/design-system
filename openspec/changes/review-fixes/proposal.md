## Why

A review rendered every story in a real browser, in both appearances, and
compared what it painted against the artboards. The suite is green and the
artboards are right; the built components disagree with both, and no check
could see it because every check reads class strings or stylesheet text rather
than what the browser resolves.

**What the browser actually paints:**

- A disabled or loading primary, secondary or destructive button is
  indistinguishable from a resting one, and still changes colour on hover. The
  variant colours are utilities; the inert state lives in the components layer;
  utilities win. Only ghost goes grey, because ghost has no fill to lose to.
- Every `font-medium`, `font-semibold` and `font-light` in the package is dead.
  The register nulls Tailwind's weights and remaps only the per-step names, so
  labels, dialog titles, the empty-state title and badges all render at 400.
- The type scale's leading, tracking and weight never apply. `text-xl` emits
  `font-size` alone, because Tailwind v4 pairs a step's line-height through
  `--text-xl--line-height`, not through `--leading-xl`. Everything inherits the
  body's 22 px line-height, which is why a 10 px badge stands 28 px tall.
- Attributes on `Input`, `Select` and `Combobox` land on the wrapper `div`, not
  the control. `placeholder`, `name`, `autocomplete`, `required` and `@blur`
  all miss. The Fields story's own placeholder renders nothing.

**And a set of smaller defects, each verified:** the busy spinner flickers under
reduced motion instead of stopping; the dark appearance never sets
`color-scheme`, so native popups and scrollbars stay light; a computed over
`useSlots()` never updates, so a header that appears after mount is not
rendered and a dialog keeps describing a body that is gone; the combobox's
active option scrolls out of view and loses its chosen fill while active; a
closed combobox swallows the Escape a dialog was waiting for; the dialog's
close button has no name unless a slot is filled, silently; the focus ring is a
box-shadow, which forced-colours mode discards; placeholder text is measured
against the wrong surface and at the non-text floor.

## What Changes

- **Fixed:** the inert state of a button holds against its variant colours and
  its hover, in both appearances.
- **Fixed:** one `text-<step>` utility carries the step's size, line height,
  tracking and weight, as `tokens.css` always said it did.
- **New:** four named weight tokens (`light`, `regular`, `medium`, `semibold`)
  and the `font-*` utilities that map to them, so a component can depart from
  a step's default weight on purpose.
- **Fixed:** fallthrough attributes and listeners on the three fields reach the
  control; `class` and `style` stay on the root.
- **Changed:** `Dialog` takes a required `closeLabel` prop and drops the
  `close-label` slot. A close button with no name is now impossible rather than
  silent.
- **Fixed:** slot presence is read at render time in `Card`, `EmptyState` and
  `Dialog`.
- **Fixed:** the combobox keeps its active option in view, gives the active
  state precedence over the chosen fill, opens on click, walks the filtered
  list from either end, ignores a drag on its own scrollbar, and leaves Escape
  alone when it has nothing to do with it.
- **Fixed:** the dialog reports one close per close, and a drag that ends on
  the backdrop is not a dismissal.
- **Fixed:** the busy spinner stops under reduced motion.
- **Fixed:** `color-scheme` follows the appearance.
- **Changed:** the focus ring is an outline, so forced-colours mode and
  clipping ancestors keep it.
- **Changed:** placeholder text uses `ink-muted`, and the pair table measures
  the pairs the components actually draw.
- **Changed:** an interactive `Card` contains no block elements a button may
  not hold.
- **Changed:** an error message on a field is announced when it appears.
- **New:** a check that compiles the stylesheet the way a consumer's Tailwind
  would and asserts every class a component wears produces a rule. This is the
  check whose absence let the first three defects ship.
- **Changed:** `package.json` drops the dead `test:e2e` script; `config.yaml`,
  the ADR and the README describe the toolchain and the counts as they are.
- **Changed:** the public entry and the components import without a `.ts`
  extension, so a consumer's typecheck does not depend on
  `allowImportingTsExtensions`.

**User-visible outcome:** the interface a consuming project gets is the one on
the artboards - disabled buttons look disabled, labels are labels, badges are
badge-sized, placeholders exist - and the catalog can no longer be green while
that is false.

### Non-Goals

- **No new component, no new variant.** Everything here restores or protects
  behaviour the artboards and the design language already promised.
- **No change to the four-line consumer contract.**
- **No change to any colour token value.** The placeholder fix chooses a
  different existing role; it does not move the palette.
- **The interactive card's resting rail stays as it is.** The artboard draws
  only the hovered state, so which rail a resting card shows is a design
  decision still to make, not a defect to fix here.
- **No rem type scale.** Sizes stay in px; moving them is a separate decision
  with a wider blast radius than a defect fix.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- **button** - the inert state's appearance is a requirement, not an intention.
- **form-field** - attributes reach the control; an error is announced.
- **dialog** - the close action is named by the project, through a prop.
- **combobox** - the active option stays in view; the field opens on click;
  Escape is only claimed when there is something to leave.
- **design-tokens** - named weights, `color-scheme`, and a type step that
  carries all four facets through one utility.
- **tailwind-registers** - every class a component wears compiles; the focus
  ring survives forced colours; controls and actions opt out of the tap delay.

## Impact

- **Changed files:** `registers.css`, `tokens.css`, `classMaps.ts`, every
  component, the palette pair table, the stories, the tests, four documents.
- **Consumers:** `Dialog` gains a required prop and loses a slot. Four token
  names are added; none is renamed. Attributes on the fields move from the
  wrapper to the control, which is the behaviour every consumer assumed.
- **Risk:** the compiled-class check runs Tailwind's compiler inside Vitest and
  depends on `@tailwindcss/node` and `@tailwindcss/oxide`, which the Vite
  plugin already brings. If Tailwind changes that API the check breaks loudly,
  which is the right direction.
