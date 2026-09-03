## ADDED Requirements

### Requirement: A type step carries all four facets through one utility

Each step of the type scale SHALL apply its size, line height, tracking and
default weight through the single `text-<step>` utility. The four facets remain
separate tokens so a project can move one without restating the others.

#### Scenario: A component uses a step

- **WHEN** an element wears `text-xl` and nothing else from the scale
- **THEN** it renders at the `xl` size, the `xl` line height, the `xl` tracking
  and the `xl` weight

#### Scenario: A component departs from a step's weight

- **WHEN** an element wears `text-xl font-light`
- **THEN** it renders at the `xl` size and line height at the light weight

### Requirement: Named weights are tokens

The package SHALL declare `--fds-weight-light`, `--fds-weight-regular`,
`--fds-weight-medium` and `--fds-weight-semibold`, and SHALL map the matching
`font-light`, `font-regular`, `font-medium` and `font-semibold` utilities to
them.

#### Scenario: A named weight is used

- **WHEN** an element wears `font-medium`
- **THEN** its weight resolves to the `--fds-weight-medium` token

### Requirement: The colour scheme follows the appearance

The document SHALL declare `color-scheme: light` in the light appearance and
`color-scheme: dark` in the dark appearance, by every route the appearance is
chosen, so native form chrome, popups and scrollbars match the tokens.

#### Scenario: The dark appearance is active

- **WHEN** the appearance is dark, whether by system preference or by the
  `data-theme` attribute
- **THEN** the root's colour scheme is dark

## MODIFIED Requirements

### Requirement: Contrast floors are measured, not asserted

Every colour pair the package relies on SHALL meet its floor: 4.5:1 for text and
3:1 for non-text, in both appearances. The floors are checked against computed
values, never against a designer's judgement. Placeholder is text, and a pair a
component draws SHALL be measured on the surface it is actually drawn on.

#### Scenario: The token values are checked

- **WHEN** the contrast check runs over the shipped token values
- **THEN** every declared pair reports a ratio at or above its floor in both
  appearances

#### Scenario: A value change drops a pair below its floor

- **WHEN** a token value is edited so that a pair falls below its floor
- **THEN** the check fails
- **AND** the failure names the pair, the measured ratio and the floor it missed

#### Scenario: Placeholder text in a control

- **WHEN** a control shows placeholder text on its sunken surface
- **THEN** the pair clears 4.5:1 in both appearances

#### Scenario: A pair used by a component is added

- **WHEN** a component draws a foreground on a background not yet in the pair
  table
- **THEN** the pair is added and measured, rather than assumed from a similar
  one
