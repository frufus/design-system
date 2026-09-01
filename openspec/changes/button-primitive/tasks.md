## 1. Pure logic first: the class maps

- [x] 1.1 Write `tests/class-maps.test.ts`: every documented variant and size has
      an entry, an unknown key falls back to the default, and no entry contains a
      template placeholder.
      **Verified by:** `npm run test -- class-maps` fails when an entry is
      removed.
- [x] 1.2 Implement `src/classMaps.ts` until 1.1 is green.
      **Verified by:** the same run, with no test skipped.
- [x] 1.3 Extend the enforcement check to fail on a class name assembled from a
      variable.
      **Verified by:** `npm run lint` fails when a template literal containing a
      class name and an interpolation is added to a component.

## 2. Button behaviour, before Button appearance

- [x] 2.1 Write `tests/button.test.ts` for behaviour only: it emits on click,
      emits nothing when disabled, emits nothing while loading, keeps the label
      while loading, reports busy while loading, and defaults `type` to `button`.
      **Verified by:** `npm run test -- button` — every case fails for want of a
      component.
- [x] 2.2 Implement `src/components/Button.vue` until 2.1 is green.
      **Verified by:** the same run.
- [x] 2.3 Add the accessible-name cases: a slotted label names the button, and an
      icon-only button carries the name the consumer supplies.
      **Verified by:** the same run, asserting the computed accessible name.

## 3. Appearance, from the maps

- [x] 3.1 Wire variant, size and state to the class maps, and take the focus ring
      and the disabled colours from the register rather than declaring them.
      **Verified by:** a test asserts the rendered class list for each variant and
      that no variant declares a ring of its own.
- [x] 3.2 Give the small size a 44 px target without changing its visible box.
      **Verified by:** a test asserts the target-restoring class is present at
      the small size and absent at the others.

## 4. The catalog entry

- [x] 4.1 Write `stories/Button.stories.ts` with the canvas's matrix: four
      variants against rest, hover, active, focus, disabled and loading, plus the
      three sizes and an icon-only example.
      **Verified by:** the catalog builds and every story appears in
      `storybook-static/index.json`.

## 5. Export and close

- [x] 5.1 Export `Button` and its prop types from `src/index.ts`.
      **Verified by:** a test imports the public entry point and finds them.
- [x] 5.2 Run the full suite, lint, typecheck, format and the catalog build.
      **Verified by:** all green, each on its own exit code, with the packed file
      count reported.
