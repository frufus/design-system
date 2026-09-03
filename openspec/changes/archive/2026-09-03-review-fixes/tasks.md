## 1. The check that was missing

- [x] 1.1 Write `tests/compiled-classes.test.ts`: compile the rehearsed consumer
      wiring, collect every class a component or class map wears, and assert
      each produces a rule. Watch it fail on `font-medium`, `font-semibold`,
      `font-light`.
      **Verified by:** `npm run test -- compiled-classes` names the three.
- [x] 1.2 In the same file, assert a `text-<step>` rule carries line-height,
      letter-spacing and font-weight, and that the inert action rule follows
      the last hover utility. Watch both fail.
      **Verified by:** the same run.

## 2. The stylesheets

- [x] 2.1 Tests first, in `registers.test.ts` and `tokens-shape.test.ts`: the
      four weight tokens and their utility mapping; the three per-step keys in
      `@theme inline`; the inert rule in `@layer utilities`; `animation: none`
      under reduced motion; the ring as `outline`; `touch-action`; the
      placeholder on `ink-muted`; `color-scheme` in all four appearance blocks.
      **Verified by:** each fails for the stated reason.
- [x] 2.2 Add the pairs the components draw to `tools/palette-report.mjs` and
      watch the contrast suite grow.
      **Verified by:** `npm run test -- appearance` counts the new pairs.
- [x] 2.3 Make `registers.css` and `tokens.css` pass all of 1 and 2.
      **Verified by:** the register, token-shape, appearance and compiled-class
      suites are green.

## 3. The components

- [x] 3.1 Fields: tests for attribute passthrough, `class`/`style` on the root,
      a listener that fires, and the error live region. Then
      `inheritAttrs: false`, the split helper, and the live region.
      **Verified by:** `npm run test -- fields field-shell combobox`.
- [x] 3.2 Slot presence: tests that a header appearing after mount renders and
      that a withdrawn body drops its reference. Then read `$slots` at render
      time in `Card`, `EmptyState`, `Dialog`.
      **Verified by:** `npm run test -- surfaces dialog`.
- [x] 3.3 Dialog: tests for `closeLabel`, one `update:open` per close, and the
      drag that is not a dismissal. Then the prop, the `close()` delegation,
      and the pointer memory. Update the stories and the smoke consumer.
      **Verified by:** `npm run test -- dialog a11y`.
- [x] 3.4 Combobox: tests for scroll-into-view, one fill on the chosen-active
      option, click to open, Escape untouched when idle, mousedown on the list,
      Up on a filtered closed list. Then the behaviour.
      **Verified by:** `npm run test -- combobox`.
- [x] 3.5 Card: test that an interactive card contains no `div`. Then spans.
      **Verified by:** `npm run test -- surfaces a11y`.
- [x] 3.6 Drop the redundant `font-*` classes where the step already carries
      the weight; keep the deliberate departures.
      **Verified by:** `compiled-classes` stays green; the Storybook matrix,
      fields, badges and empty state match the artboards by eye.

## 4. Distribution and documents

- [x] 4.1 Extensionless imports in `src/index.ts` and the components.
      **Verified by:** `npm run typecheck`, `npm run lint`, `npm run test`.
- [x] 4.2 Remove `test:e2e`; correct `config.yaml`, ADR-0001, the README and
      `DESIGN-LANGUAGE.md` (the new rule, the reduced-motion statement, the
      pair count, the token count).
      **Verified by:** `npm run test -- conventions` agrees in both directions.
- [x] 4.3 Full gate.
      **Verified by:** `npm run lint && npm run typecheck && npm run test`,
      then a rendered pass over the catalog in both appearances.
