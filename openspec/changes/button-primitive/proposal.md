## Why

The foundation renders, but the package still exports nothing a project can put
on a screen. Button is the first primitive and the one that sets the pattern:
how variants map to classes, how a state becomes markup, where the focus ring
comes from, how a story matrix is laid out, and what a component's tests assert.
Six primitives follow it, and every one of them will be read as "like Button".

Getting it wrong is therefore expensive twice — once in the component, once in
the six that copy it.

## What Changes

- **Changed:** `src/registers.css` gains an action register beside the control
  register, and a target-restoring helper.
- **New:** `src/classMaps.ts` — the explicit `Record<K, string>` maps that turn a
  variant or a size into classes. They hold only what actually varies: the
  colours and the box. No class name is ever assembled from a
  variable, so every class the build sees can be found by searching for it.
- **New:** `src/components/Button.vue` — four variants (primary, secondary,
  ghost, destructive), three sizes, a disabled state and a loading state, with
  the label arriving through a slot.
- **New:** `stories/Button.stories.ts` — the state matrix from the approved
  canvas, inspectable in both appearances.
- **Changed:** `src/index.ts` gains its first real export, and with it the
  package's first public component API.

**User-visible outcome:** a consuming project can render a button that is
correct in both appearances, keeps its 44 px target at every size, and cannot be
double-submitted while it is working.

### Non-Goals

- **No link that looks like a button.** An anchor with a button's appearance is a
  different component with different semantics, and conflating them is how
  keyboard behaviour gets broken. If it is needed, it is its own change.
- **No icon library.** The component renders whatever is put in its icon slots.
  Shipping icons is a separate decision with a separate maintenance cost.
- **No button group.** The segment on the canvas is a layout of ordinary buttons,
  not a component; it arrives with the first screen that needs it.
- **No `asChild` or polymorphic `as` prop.** Both trade a small convenience for a
  large surface of ways to produce invalid markup.

## Capabilities

### New Capabilities

- `button`: what a button guarantees — its states, its accessible behaviour under
  load, its target size, and the fact that it owns no words of its own.

### Modified Capabilities

- `tailwind-registers`: gains the action register that every button variant
  shares, and the mechanism a control below 44 pixels uses to restore its target.
  Discovered while implementing rather than while planning: the shape, focus ring
  and transition were about to be repeated per variant in the class maps, which
  is exactly the duplication the control register already exists to prevent for
  fields.

## Impact

- **New files:** `src/classMaps.ts`, `src/components/Button.vue`,
  `stories/Button.stories.ts`, and their tests.
- **Consumers:** the package's first component export. Its prop names become
  public surface on release, as the token names already are.
- **Dependencies:** none added.
- **Risk:** the pattern set here propagates by imitation rather than by
  enforcement. Where a decision is meant to be copied, this change says so in
  `design.md` rather than leaving the next component to guess.
