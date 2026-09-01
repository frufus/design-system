## 1. Pure logic first: the stylesheet parser

- [ ] 1.1 Write `tests/support/parse-css.test.ts` for a small parser that turns
      stylesheet text into a record of selector to custom-property map: nested
      at-rules, an empty block, a declaration with a `var()` value, and a
      malformed block that must throw rather than be skipped.
      **Verified by:** `npm run test -- parse-css` — all cases pass, including the
      malformed input raising a named parse error.
- [ ] 1.2 Implement `tests/support/parse-css.ts` until 1.1 is green.
      **Verified by:** the same run, with no test skipped.

## 2. Generate the colour tokens

- [ ] 2.1 Write `tools/build-tokens.mjs`: import `build('petrol')` from
      `tools/palette-report.mjs`, emit both appearances' colour custom properties
      into `src/tokens.css` between explicit generated-region markers, and leave
      the hand-written half untouched.
      **Verified by:** `node tools/build-tokens.mjs` writes the file, and running
      it twice produces no diff (`git diff --exit-code src/tokens.css`).
- [ ] 2.2 Add `npm run build:tokens` and a test asserting the committed
      `src/tokens.css` matches a fresh generation.
      **Verified by:** `npm run test -- tokens-generated` fails when a colour value
      in the committed file is edited by hand.

## 3. Vendor the typeface

- [ ] 3.1 Write `tools/subset-fonts.mjs`: fetch the two variable `woff2` from the
      pinned source package, subset them to the documented unicode ranges, and
      write them to `src/fonts/` with their SIL OFL 1.1 licence text.
      **Verified by:** `node tools/subset-fonts.mjs` produces two files whose sizes
      match the recorded expectations within a tolerance, and re-running it leaves
      no diff.
- [ ] 3.2 Add the `@font-face` declarations to `src/tokens.css`, each with an
      explicit `font-weight: 200 800` range, `font-display: swap`, and a relative
      `url()` that resolves from the package.
      **Verified by:** `npm run test -- fonts` asserts every referenced font file
      exists on disk and that the declared family names match the token values.
- [ ] 3.3 Add the author and licence to `NOTICE`.
      **Verified by:** the same test asserts `NOTICE` names the Braille Institute
      and that the licence file is present beside the fonts.

## 4. Hand-write the rest of `src/tokens.css`

- [ ] 4.1 Add the non-colour tokens from the approved canvas: font stacks, the
      eight-step type scale with line heights and tracking, the 4 px spacing scale,
      radii (0 / 2 / 4), control heights (36 / 44 / 52), row heights (40 / 52),
      border weights, and the three motion durations with both easings.
      **Verified by:** `npm run test -- tokens-shape` asserts each documented group
      is present and non-empty.
- [ ] 4.2 Add the reduced-motion block collapsing all three durations in one place.
      **Verified by:** the same test asserts the durations are redefined under
      `prefers-reduced-motion: reduce` and that no component declares its own.

## 5. Prove both appearances are complete

- [ ] 5.1 Write the appearance-parity test: every token declared in light is
      declared in dark and the reverse, and no token exists only inside a media
      query.
      **Verified by:** `npm run test -- appearance-parity`, which fails when a
      token is deleted from either block.
- [ ] 5.2 Write the contrast test over the shipped values, reusing the measured
      pair list.
      **Verified by:** `npm run test -- contrast` reports all 27 pairs passing in
      both appearances and names the pair, ratio and floor on failure.

## 6. `src/registers.css`

- [ ] 6.1 Write the `@theme` nulling block setting Tailwind's default colour, font,
      radius and shadow scales to `initial`.
      **Verified by:** `npm run test -- registers-nulled` fails if a default scale
      is still reachable.
- [ ] 6.2 Write the `@theme inline` remap claiming the utility names, every one
      pointing at a `--fds-*` variable rather than a literal.
      **Verified by:** `npm run test -- registers-mapped` fails when a mapped
      utility resolves to anything but a variable.
- [ ] 6.3 Write the shared control register in `@layer components`: height, radius,
      border, inset treatment, focus ring, and the disabled pair.
      **Verified by:** `npm run test -- control-register` asserts the register
      exists in the components layer and that its geometry comes from tokens.

## 7. Enforcement and wiring

- [ ] 7.1 Add the literal-colour check over every package file except
      `src/tokens.css`.
      **Verified by:** `npm run lint` fails when a hex literal is added to a
      stylesheet or component.
- [ ] 7.2 Confirm the `exports` map resolves both stylesheets from a consuming
      path shape.
      **Verified by:** `npm run test -- exports` resolves `./tokens.css` and
      `./registers.css` to files that exist.
- [ ] 7.3 Record the token naming as an ADR via the `adr` skill.
      **Verified by:** the ADR file exists under `docs/adr/` and names what a
      rename would cost.

## 8. Close the change

- [ ] 8.1 Run the full suite plus `openspec validate --strict`.
      **Verified by:** both green, with the test count reported.
- [ ] 8.2 Update `CLAUDE.md` commands with `build:tokens`.
      **Verified by:** every command listed in `CLAUDE.md` runs.
