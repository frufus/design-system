# design-tokens Specification

## Purpose
Defines the `--fds-*` token contract: which tokens exist, how a viewer or a
consuming project selects an appearance, what a consumer may redefine, and the
accessibility floors every value has to meet before it ships.

## Requirements

### Requirement: Every colour-bearing value comes from a token

The package SHALL express every colour through a `--fds-*` custom property.
A literal colour outside the token stylesheet is a defect, not a shortcut.

#### Scenario: A primitive needs a colour

- **WHEN** a component renders any colour-bearing property
- **THEN** the value resolves through a `--fds-*` custom property
- **AND** changing that property's value changes the rendered colour with no
  change to the component

#### Scenario: A literal colour is introduced outside the token stylesheet

- **WHEN** a hex, `rgb()` or `oklch()` literal appears in any package file other
  than the token stylesheet
- **THEN** the enforcement check fails
- **AND** the failure names the file and the literal it found

### Requirement: Light and dark are appearances of equal rank

The package SHALL define a complete set of values for both appearances. Neither
is derived from the other, and no `dark:` variant exists anywhere in the package.

#### Scenario: The viewer's system is set to dark and nothing else is declared

- **WHEN** a page using the package is opened with `prefers-color-scheme: dark`
  and no `data-theme` attribute on the document
- **THEN** the dark values apply

#### Scenario: The consuming project overrides the system preference

- **WHEN** the document carries `data-theme="light"` while the system prefers dark
- **THEN** the light values apply
- **AND** the reverse also holds: `data-theme="dark"` under a system preferring
  light yields the dark values

#### Scenario: A token is defined in only one appearance

- **WHEN** a token is declared for one appearance and not the other
- **THEN** the appearance-parity check fails
- **AND** the failure names the token and the appearance that is missing it

### Requirement: Contrast floors are measured, not asserted

Every colour pair the package relies on SHALL meet its floor: 4.5:1 for text and
3:1 for non-text, in both appearances. The floors are checked against computed
values, never against a designer's judgement.

#### Scenario: The token values are checked

- **WHEN** the contrast check runs over the shipped token values
- **THEN** every declared pair reports a ratio at or above its floor in both
  appearances

#### Scenario: A value change drops a pair below its floor

- **WHEN** a token value is edited so that a pair falls below its floor
- **THEN** the check fails
- **AND** the failure names the pair, the measured ratio and the floor it missed

### Requirement: A consumer rethemes by redefining token values

A consuming project SHALL be able to change the identity by redefining `--fds-*`
values on its own `:root`, with no build step, no JavaScript and no fork.

#### Scenario: A consumer redefines the accent

- **WHEN** a consuming project declares its own value for the accent token on
  `:root` after importing the package stylesheets
- **THEN** every utility and component that draws on the accent renders in the
  new value
- **AND** the package itself is neither rebuilt nor modified

#### Scenario: A consumer redefines a token that does not exist

- **WHEN** a consuming project declares a `--fds-*` property the package does not
  define
- **THEN** nothing changes and no error is raised
- **AND** this is documented, because a silent no-op is otherwise
  indistinguishable from a typo

### Requirement: The typeface is served by the consuming project, never fetched

The package SHALL carry its typefaces as files and serve them from the consuming
project's own origin. No stylesheet, script or font file may be requested from a
third-party host at runtime.

#### Scenario: A page using the package is opened

- **WHEN** any page built on the package renders
- **THEN** the fonts load from the consuming project's own origin
- **AND** no request is made to any font host, CDN or analytics endpoint

#### Scenario: The page is opened with no network at all

- **WHEN** the application is running offline and its own assets are cached
- **THEN** the interface renders in the intended typeface rather than a fallback

#### Scenario: A weight is not stated

- **WHEN** an element inherits the monospace family without a declared weight
- **THEN** it must still render at the intended weight, because the variable
  font's default instance is its lightest and would otherwise render far too thin
- **AND** the package declares the weight rather than relying on that default

### Requirement: The typeface licence travels with the files

The package SHALL ship the full licence text beside the font files and name their
author, so a consuming project can satisfy its own attribution obligations without
research.

#### Scenario: A consuming project audits its dependencies

- **WHEN** someone inspects the installed package for third-party assets
- **THEN** the licence text is present alongside the fonts
- **AND** the author is named in the package's notice file

### Requirement: Token names are the package's public surface

The set of token names SHALL be treated as an API. Renaming or removing one is a
breaking change for every consuming project.

#### Scenario: A token is renamed

- **WHEN** a token name changes
- **THEN** the change is released as a breaking change
- **AND** an architecture decision record states what moved and why
