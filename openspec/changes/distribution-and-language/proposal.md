## Why

Everything built so far has been verified from inside the package. The one claim
that has never been tested is the one the whole architecture rests on: that a
project can install this thing and have it work.

The package ships `.vue` source rather than a bundle, which means the consumer's
Tailwind has to find our class names, our `exports` map has to resolve, our
`files` list has to actually contain the fonts, and the four-line wiring has to
be right. Every one of those fails silently — unstyled output, no error — and
none of them is exercised by a test that runs inside the repository.

The second half is the written rule set. Three enforcement checks exist and one
does not, and none of them is explained anywhere a person would look.

## What Changes

- **New:** a real consumer smoke test. The package is packed as a tarball,
  installed into a throwaway application, and built. What is asserted is what a
  project would actually see: that the build succeeds, that the tokens reach the
  output, that the register and the claimed utilities are emitted, and that no
  Tailwind default colour comes back.
- **New:** `docs/DESIGN-LANGUAGE.md` — the rules, why each exists, and which
  check enforces it. A rule with no check says so.
- **New:** a fourth check, forbidding `<style scoped>` in the package.
- **Changed:** the three existing checks and the new one move behind one
  conventions runner, so `npm run lint` has one thing to say rather than four.

**User-visible outcome:** the distribution story stops being an assumption. If it
is broken, the smoke test says so here rather than a consuming project finding out.

### Non-Goals

- **No published package.** Packing and installing locally proves the contents;
  publishing is a separate decision with a version number attached.
- **No CI configuration.** Which runner executes this is the repository's
  decision, not this change's.
- **No visual regression testing.** Named in an earlier change and still true.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `tailwind-registers`: the four-line wiring requirement gains a scenario that is
  actually exercised — a packed install, not a rehearsal. The requirement's text
  does not change; what changes is that it is now proven rather than asserted.

## Impact

- **New files:** the smoke-test harness and its fixture application,
  `docs/DESIGN-LANGUAGE.md`, and the conventions runner.
- **Consumers:** none. Nothing in `src/` changes.
- **Dependencies:** none added to the package. The fixture installs the packed
  tarball plus Vue, Vite and Tailwind, in a temporary directory.
- **Risk:** the smoke test is slow and needs network access for the fixture's own
  dependencies, so it is a separate command rather than part of `npm run test`.
  A gate nobody runs protects nothing, so it is named in `CLAUDE.md` and in the
  design language as the check that matters most.
