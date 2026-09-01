## 1. The consumer smoke test

- [ ] 1.1 Write `tools/smoke-consumer.mjs`: pack the package, install the tarball
      into a temporary application with Vue, Vite and Tailwind, wire it with the
      documented four lines, import every primitive, and build.
      **Verified by:** `npm run test:consumer` completes and reports the built
      asset sizes.
- [ ] 1.2 Assert the built output rather than the exit code: tokens present, the
      control and action registers present, claimed utilities present, and no
      Tailwind default colour.
      **Verified by:** the same command fails when the `@source` line is removed
      from the fixture.
- [ ] 1.3 Prove it catches a broken published surface.
      **Verified by:** removing `src` from the package's `files` makes the run
      fail, and restoring it makes it pass.

## 2. The fourth check and one runner

- [ ] 2.1 Write the `<style scoped>` check with its tests.
      **Verified by:** `npm run test -- conventions` fails when a scoped style
      block is added to a component.
- [ ] 2.2 Move all four checks behind `tools/check-conventions.mjs` and simplify
      the lint script.
      **Verified by:** `npm run lint` runs all four and reports each by name.

## 3. The written rules

- [ ] 3.1 Write `docs/DESIGN-LANGUAGE.md`: each rule, why it exists, and which
      check enforces it - or that none does.
      **Verified by:** a test asserts every check named in the document exists,
      and every check that exists is named in the document.

## 4. Close

- [ ] 4.1 Update `CLAUDE.md` with the new commands.
      **Verified by:** every command listed there runs.
- [ ] 4.2 Full gate plus the smoke test.
      **Verified by:** all green, each on its own exit code.
