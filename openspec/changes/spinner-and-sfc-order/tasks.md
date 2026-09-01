## 1. The spinner

- [x] 1.1 Write the failing test: the busy indicator carries the shared spin
      class, and the register declares an animation for it that uses a duration
      token.
      **Verified by:** `npm run test -- button` and `npm run test -- registers`.
- [x] 1.2 Add `.fds-spin` and its keyframes to `registers.css`, and apply it in
      Button.
      **Verified by:** the same runs.

## 2. The ordering

- [x] 2.1 Write the `template-before-script` check and its tests, including a
      file with no template, which the rule has nothing to say about.
      **Verified by:** `npm run test -- conventions`.
- [x] 2.2 Add it to the conventions runner and watch it fail against the eight
      components as they stand.
      **Verified by:** `npm run lint` reports all eight by name.
- [x] 2.3 Reorder all eight, and watch it pass.
      **Verified by:** `npm run lint` is clean and the suite is unchanged.

## 3. Close

- [x] 3.1 Document both rules in `docs/DESIGN-LANGUAGE.md`.
      **Verified by:** the document-and-checks test agrees in both directions.
- [x] 3.2 Full gate.
      **Verified by:** all green, each on its own exit code.
