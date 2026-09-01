## Context

See `proposal.md` — Why.

## Decisions

### The rotation lives in the register, not in the component

`@keyframes` and the animation go into `registers.css` beside the other shared
behaviour, as `.fds-spin`. A component that declared its own animation would be
holding a value that is not a token - the same reason components carry no style
block at all.

The duration is a token. Under `prefers-reduced-motion: reduce` the durations
already collapse in one place, so the spinner stops with everything else rather
than needing its own opt-out.

_Alternative rejected:_ an inline `style` with a keyframe name. It would work and
it would be the first component-local animation, which is how a system ends up
with six slightly different spinners.

### The check compares positions, not shapes

`template-before-script` finds the index of the first `<template` and the first
`<script` in a `.vue` file and fails when the script comes first. It deliberately
does not parse the SFC: the question is about ordering in the file, and a parser
would be a large dependency for a comparison of two numbers.

_Consequence:_ a file with no template - none exists here - is ignored rather
than reported, because the rule has nothing to say about it.

## Risks / Trade-offs

- **Reordering eight files touches every component at once.** → Mechanical, and
  the suite covers all of them. Reviewed as a diff of moves rather than of
  content.

- **A check on file layout is a style rule, and style rules can be noise.** →
  This one exists because the convention was asked for explicitly and because the
  cost of it drifting is that half the components read one way and half the
  other. It reports in the same shape as the other four.
