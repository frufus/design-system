## Context

See `proposal.md` — Why. The package ships source, so the consumer's Tailwind
does the compiling. That decision is what makes an installed test necessary: it
moves the failure modes into the consumer's build, where this repository's own
tooling cannot see them.

## Goals / Non-Goals

**Goals:**

- Prove the distribution against what is actually published.
- One place a person can read the rules and find which check enforces each.

**Non-Goals:**

- No publishing, no CI wiring, no visual regression. All in the proposal.

## Decisions

### Pack a tarball; do not link the directory

The smoke test runs `npm pack` and installs the resulting tarball.

_Alternative rejected:_ installing the repository by path. npm links it, so the
consumer sees the working tree - including files the `files` list excludes. A
missing entry there is exactly the failure this test exists to catch, and linking
would hide it.

### Assert the built output, not the build's exit code

A Tailwind misconfiguration produces a successful build with no styles in it -
silent, and the reason `@source` is part of the documented contract. So the test
reads the built CSS and requires the tokens, the registers and the claimed
utilities to be present, and requires no Tailwind default colour to have come back.

_Alternative rejected:_ rendering the app and screenshotting it. Stronger, much
slower, and it needs a browser; it belongs with the visual regression work rather
than with the distribution question.

### It is its own command, not part of `npm run test`

It packs, installs and builds, so it takes far longer than every other check
combined and needs network access for the fixture's own dependencies. Folding it
into the fast suite would make people stop running the fast suite.

_Consequence:_ a gate nobody runs protects nothing. It is named in `CLAUDE.md`,
and the design language calls it the check that matters most.

### One conventions runner

The three existing checks plus the new one move behind `tools/check-conventions.mjs`.
Four scripts chained in a lint script was the point at which the composition
stopped being readable, and the earlier commit that added the third said so.

### `<style scoped>` is forbidden, and the check says why

Scoped styles are how a component starts holding values that are not tokens.
The rule already existed in the project's context; it now has a check.

## Risks / Trade-offs

- **The smoke test needs the network.** → Stated. It cannot be otherwise: a
  fixture that vendored its own Vue and Tailwind would no longer resemble an
  installation.

- **A slow gate gets skipped.** → Named in `CLAUDE.md` and in the design
  language, and it is the only check that can catch a broken `files` list or a
  broken `exports` map.

- **Documentation drifts from the checks it describes.** → Each rule in the
  design language names the check that enforces it, and the ones with no check
  say so plainly rather than implying coverage.
