## 1. Tones first

- [ ] 1.1 Write `tests/badge-tones.test.ts`: every documented tone has an entry,
      an unknown tone falls back to neutral, and every tone's ink and fill are a
      pair the contrast suite already measures.
      **Verified by:** `npm run test -- badge-tones`.
- [ ] 1.2 Add the tone map to `src/classMaps.ts` until 1.1 is green.
      **Verified by:** the same run.

## 2. Badge

- [ ] 2.1 Write the behaviour tests: the label comes from the slot, the status
      mark is hidden from assistive technology, and an unknown tone renders
      neutral.
      **Verified by:** `npm run test -- badge`.
- [ ] 2.2 Implement `src/components/Badge.vue`.
      **Verified by:** the same run.

## 3. Card

- [ ] 3.1 Write the tests: a presentational card is not focusable and exposes no
      control semantics; an interactive card renders a button, is focusable,
      emits on activation, and wears the shared focus ring.
      **Verified by:** `npm run test -- card`.
- [ ] 3.2 Implement `src/components/Card.vue` with header and footer slots that
      render nothing when empty.
      **Verified by:** the same run, plus a test asserting no empty strip is
      emitted.

## 4. EmptyState

- [ ] 4.1 Write the tests: it shows only the words supplied, and renders without
      an action when none is given.
      **Verified by:** `npm run test -- empty-state`.
- [ ] 4.2 Implement `src/components/EmptyState.vue`.
      **Verified by:** the same run.

## 5. Catalog, accessibility and close

- [ ] 5.1 Write stories for all three, including a card with actions in its
      footer beside an interactive card, so the nesting constraint is visible.
      **Verified by:** the catalog builds and every story is indexed.
- [ ] 5.2 Extend the axe suite to all three, in both appearances.
      **Verified by:** `npm run test -- a11y` reports no violations.
- [ ] 5.3 Export all three and assert the public surface; run the full gate.
      **Verified by:** all green, each on its own exit code.
