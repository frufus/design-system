## Context

See `proposal.md` — Why. The constraints that shape the approach:

- Tailwind v4 is CSS-first here. There is no `tailwind.config.js` and no PostCSS
  pipeline, so everything the theme knows has to be expressible in CSS.
- The package ships `.vue` source rather than a bundle, so the consumer's Tailwind
  makes exactly one pass over both their code and ours.
- The values are already settled and measured. `tools/palette-report.mjs` holds
  the lightness ladders, the per-direction hue and chroma stance, the semantic map
  and the pair list, and it is what the approved canvas was drawn from.
- The identity is Petrol on the Console structure: no shadows in either
  appearance, radius 0 for surfaces / 2 for tags / 4 for controls, display rows at
  40 px and interactive rows at 52 px so a control keeps its 44 px target.

## Goals / Non-Goals

**Goals:**

- One place where the colour values live, and it is the same place the canvas was
  measured from.
- A consumer can retheme by redefining values, without a fork or a build step.
- The foundation fails loudly when it is wrong: appearance parity, contrast
  floors, surviving defaults and literal colours are all checked.

**Non-Goals:**

- No CSS-in-JS, no theme object, no token JSON published for other tools. If a
  second consumer format is ever needed it is a separate change with its own
  argument.
- No attempt to support Tailwind v3. The nulling and `@theme inline` are v4
  mechanics and the peer range says so.
- No runtime API for switching appearance. Setting an attribute is the API.

## Decisions

### Generate the colour half of `tokens.css`, hand-write the rest

`tools/build-tokens.mjs` imports `build('petrol')` from the existing measurement
tool and emits the colour custom properties for both appearances. Type, spacing,
radius, control heights and motion are hand-written in the same file, because they
are not derived from anything and a generator for them would be indirection with
no source of truth behind it.

*Alternative rejected:* hand-write the colours too. It was how the canvas started,
and the first draft already carried three ratios that had been rounded the wrong
way. A swatch and the number printed beside it must come from one computation.

*Alternative rejected:* generate at build time from the consumer's side. That
would make the package a build-tool dependency instead of a stylesheet, which the
"ships source, one Tailwind pass" decision rules out.

The generated file is committed, not built on install. A consumer never runs the
generator; `npm run build:tokens` regenerates it and the test suite fails if the
committed file and a fresh generation disagree.

### Three selectors, in a fixed order

```css
:root { /* light values */ }
@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) { /* dark */ } }
:root[data-theme='dark'] { /* dark */ }
:root[data-theme='light'] { /* light */ }
```

Light is the bare `:root` declaration so that a token can never exist only inside
a media query — the failure mode where a page loses its colours in one appearance
and nobody notices until a screenshot. The `:not([data-theme='light'])` guard is
what lets an explicit light choice win under a dark system, and the two attribute
blocks make the toggle authoritative in both directions.

*Alternative rejected:* `light-dark()`. It is well supported now, but it puts both
values inside every declaration, which makes a consumer's override a two-value
edit instead of a one-value edit and defeats the retheming story.

### Namespace the raw tokens, keep the utility names clean

Recorded as [ADR-0001](../../../docs/adr/0001-token-names-are-the-public-surface.md),
because the names outlive this change: they are the package's public surface
and a rename is a breaking change for every consumer at once.

Raw tokens are `--fds-*`; `@theme inline` maps them onto unprefixed utility names.
A shared package cannot claim `--color-bg` without risking a collision with the
consumer's own tokens, and `@theme inline` maps a utility to the *variable* rather
than its value — which is exactly the mechanism that makes runtime retheming work
without a single `dark:` variant.

### The control register lives in `@layer components`

Height, radius, border, the inset treatment and the focus ring for form controls
are one class in `@layer components`, not a set of utilities repeated per
component. Layer placement matters: a consumer's utility must still be able to
override the register on a specific element, and `@layer components` loses to
utilities by design.

*Alternative rejected:* `@apply`. It is banned in this project, and here it would
also inline the values at build time, breaking the runtime retheming the whole
architecture rests on.

### Vendor two variable subsets, not sixteen static files

Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono ship as one variable
`woff2` each, subset to basic Latin plus the Latin-1 supplement and the handful of
punctuation and symbols the package actually draws. That is 30.3 KB and 15.4 KB
for the whole 200–800 range of both families — against roughly 100 KB for the
eight static weights the type scale would otherwise need, and two requests instead
of eight.

*Alternative rejected:* static weights. Cheaper per file, more files, and it makes
the scale's weights a build-time commitment rather than a token one.

*Alternative rejected:* leaving the font to the consumer. The face is the reason
this identity is legible in the first place; making it optional would mean the
package's own primitives are drawn in something the design was never checked in.

`tools/subset-fonts.mjs` records the subsetting so it is reproducible rather than
folklore: source package and version, the unicode ranges, and the expected output
sizes. It is an authoring step — a consumer never runs it, and CI does not need
`fonttools` installed.

**One trap worth writing down.** The mono variable's default instance is
ExtraLight, not Regular. Anything that reaches the family without stating a weight
renders far too thin, so every rule that sets the mono family sets a weight beside
it, and a test asserts that.

### The checks parse, they do not grep

The tests read the shipped stylesheets and parse them into a record of selector to
custom-property map before asserting anything, per the project's boundary rule. A
regex over raw text would pass a stylesheet that is malformed in exactly the way
that matters — a missing brace that silently swallows the dark block.

## Risks / Trade-offs

- **A hand-written parser is a liability.** → Keep it deliberately small: it
  handles the subset this package actually writes, and fails loudly on anything
  it does not recognise rather than skipping it. Generated output means the input
  shape is ours, not arbitrary CSS.

- **Atkinson runs wider than a neutral grotesque.** → The dense row holds less
  text at the same size. The row grid gives the key column fixed width and lets
  the value column flex, so the effect lands in wrapping rather than in overlap;
  the type scale's base size was set against a dense row, not against prose.

- **The fonts add about 46 KB to every consuming bundle.** → Stated in the
  proposal's Impact so it can be argued with rather than discovered. It buys the
  whole weight range of both families and removes a third-party request from every
  page, which is the trade this project's non-negotiables already imply.

- **Nulling the default theme is hostile to a consumer who wanted Tailwind's
  palette.** → That is the point, and it is stated in the capability spec so it
  is discovered at install time rather than mid-project. A consumer who wants the
  defaults should not install this package.

- **Token names become an API on first release.** → The naming is settled in this
  change and recorded as an ADR, so a later rename is visibly a breaking change
  rather than a refactor.

- **`@source` is easy to forget and fails silently.** → The consumer smoke test in
  a later task is what actually proves the wiring; until then the symptom is
  documented in the register spec.

## Open Questions

None that can be deferred. The one genuinely open item — vendoring the font — is
scoped out in the proposal rather than left unanswered here.
