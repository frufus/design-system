# tailwind-registers Specification

## Purpose
Defines how Tailwind utilities resolve inside a project that installs this
package: which default utilities stop existing, which utility names the package's
tokens claim, and the shared control register that keeps every form control the
same shape.

## Requirements

### Requirement: Tailwind's default theme is unavailable

The package SHALL null Tailwind's default theme rather than extend it. A palette
that is merely extended leaves the defaults available, and available means
eventually used.

#### Scenario: A consumer reaches for a Tailwind default colour

- **WHEN** a consuming project writes a utility from Tailwind's default palette,
  such as a stock red or slate step
- **THEN** the utility produces no colour, because that scale no longer exists
- **AND** the omission is visible immediately rather than at review time

#### Scenario: A default scale survives the nulling

- **WHEN** the register check runs over the shipped stylesheets
- **THEN** it fails if any Tailwind default colour, font or radius scale is still
  reachable
- **AND** the failure names the scale that survived

### Requirement: Utilities resolve to variables, not to values

The utility names the package claims SHALL map onto the token custom properties
themselves, not onto their resolved values, so that changing a token at runtime
repaints everything that uses it.

#### Scenario: The appearance changes while the page is open

- **WHEN** the `data-theme` attribute on the document changes
- **THEN** every element styled through a mapped utility repaints in the new
  appearance
- **AND** no stylesheet is refetched and no rebuild occurs

#### Scenario: A mapped utility is wired to a literal value

- **WHEN** the register check parses the mapping block
- **THEN** it fails if a mapped utility resolves to anything other than a
  `--fds-*` custom property
- **AND** the failure names the utility

### Requirement: Form controls share one register

Input and Select SHALL take their height, radius, border, inset treatment and
focus ring from one shared register rather than each declaring its own geometry.

#### Scenario: Two different controls sit side by side

- **WHEN** an Input and a Select are rendered next to each other
- **THEN** they present the same height, radius, border weight and focus ring
- **AND** a change to the register moves both

#### Scenario: A control declares its own geometry

- **WHEN** a component sets a control height, radius or focus ring of its own
  instead of using the register
- **THEN** the enforcement check fails and names the component

### Requirement: A consuming project wires the package in four lines

The package SHALL be usable through exactly four CSS lines: the Tailwind import,
a source declaration covering the package's own files, and the two package
stylesheets. Changing this contract is a breaking change.

#### Scenario: A project follows the documented wiring

- **WHEN** a project imports Tailwind, declares the package directory as a source,
  and imports the two package stylesheets
- **THEN** the primitives render fully styled
- **AND** no further configuration file is required

#### Scenario: The source declaration is omitted

- **WHEN** a project imports the two stylesheets but does not declare the package
  directory as a source
- **THEN** the primitives render unstyled, because Tailwind does not scan
  installed dependencies for class names by default
- **AND** this symptom and its cause are documented, since the page renders
  without raising any error

### Requirement: Stylesheets are parsed before they are asserted on

The checks SHALL read the shipped stylesheets as text and parse them into a
known shape — a record of custom-property name to declared value, per selector —
before making any assertion. No check may match against raw file text.

#### Scenario: A stylesheet cannot be parsed

- **WHEN** a shipped stylesheet cannot be parsed into that shape
- **THEN** the check fails with a parse error naming the file
- **AND** it does not fall back to matching raw text, which would let a malformed
  stylesheet pass as if it were correct
