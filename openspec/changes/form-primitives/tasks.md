## 1. The wiring, before either control

- [ ] 1.1 Write `tests/field-shell.test.ts`: the label points at the control, a
      generated identifier is unique across two instances, a description is
      referenced and its reference resolves, an error is referenced before the
      description, and no dangling reference exists when neither is supplied.
      **Verified by:** `npm run test -- field-shell` — every case fails for want
      of the shell.
- [ ] 1.2 Implement `src/components/FieldShell.vue` until 1.1 is green.
      **Verified by:** the same run.

## 2. Input

- [ ] 2.1 Write `tests/input.test.ts`: it round-trips `v-model`, reports invalid
      when given an error, is inert when disabled, takes its shape from the
      control register, and shows only the words the project supplied.
      **Verified by:** `npm run test -- input`.
- [ ] 2.2 Implement `src/components/Input.vue` until 2.1 is green.
      **Verified by:** the same run.

## 3. Select

- [ ] 3.1 Write `tests/select.test.ts`: the same wiring assertions as Input, plus
      that options come from the project and the selected value round-trips.
      **Verified by:** `npm run test -- select`.
- [ ] 3.2 Implement `src/components/Select.vue` as a native select on the control
      register.
      **Verified by:** the same run, and a test asserting the rendered element is
      a `select`.

## 4. The catalog and the accessibility gate

- [ ] 4.1 Write stories for both, covering rest, description, error, disabled and
      the sizes.
      **Verified by:** the catalog builds and every story is indexed.
- [ ] 4.2 Assert accessibility with and without an error, in both appearances.
      **Verified by:** `npm run test -- a11y` runs axe over the rendered field in
      four combinations and reports no violations.

## 5. Export and close

- [ ] 5.1 Export both components and their types; assert the public surface.
      **Verified by:** `npm run test -- public-api`.
- [ ] 5.2 Full suite, lint, typecheck, format, catalog build.
      **Verified by:** all green, each on its own exit code.
