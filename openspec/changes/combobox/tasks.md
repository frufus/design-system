## 1. Filtering, before any markup

- [ ] 1.1 Write `tests/combobox-filter.test.ts`: the default matcher is a
      case-insensitive substring, empty text matches everything, a supplied
      matcher replaces the default, and nothing matching yields an empty list.
      **Verified by:** `npm run test -- combobox-filter`.
- [ ] 1.2 Implement the matcher until 1.1 is green.
      **Verified by:** the same run.

## 2. The keyboard, case by case

- [ ] 2.1 Write `tests/combobox.test.ts` covering every scenario in the spec:
      Down on a closed list, wrapping at both ends, Home and End, Enter, Escape
      once and twice, and Tab away.
      **Verified by:** `npm run test -- combobox` — every case fails for want of
      a component.
- [ ] 2.2 Implement `src/components/Combobox.vue` until 2.1 is green.
      **Verified by:** the same run.

## 3. What it tells assistive technology

- [ ] 3.1 Assert the ARIA surface: the roles, that the active-option reference
      resolves to a rendered option, that focus never leaves the field, that no
      reference remains when closed, and that the chosen option is marked by a
      check as well as a fill.
      **Verified by:** `npm run test -- combobox` and `npm run test -- a11y`.
- [ ] 3.2 Assert the live region: it reports the count in the project's words and
      stays empty when the project supplies none.
      **Verified by:** the same run.

## 4. Value integrity

- [ ] 4.1 Assert that leaving with unmatched text restores rather than commits,
      and that a value outside the options shows empty text.
      **Verified by:** `npm run test -- combobox`.

## 5. Catalog and close

- [ ] 5.1 Write stories: a long list, a custom matcher, an empty result, and one
      beside `Select` showing when each is the right answer.
      **Verified by:** the catalog builds and the stories are indexed.
- [ ] 5.2 Export it, document it in the design language, and run the full gate
      plus the consumer smoke test.
      **Verified by:** all green, each on its own exit code.
