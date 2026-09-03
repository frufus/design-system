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

The claim SHALL be proven against a real installation of the published contents,
not against the repository's own files.

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

#### Scenario: The published contents are installed and built

- **WHEN** the package is packed, installed into an application, wired with the
  four lines, and built
- **THEN** the build succeeds
- **AND** the output carries the tokens, the shared registers and the utilities
  the package claims
- **AND** no Tailwind default colour appears in the output

#### Scenario: A file the package needs is left out of what is published

- **WHEN** a file the package references is missing from the published contents
- **THEN** the installed build fails or its output lacks what that file provides
- **AND** the failure is reported against the package rather than discovered by a
  consuming project

### Requirement: Stylesheets are parsed before they are asserted on

The checks SHALL read the shipped stylesheets as text and parse them into a
known shape — a record of custom-property name to declared value, per selector —
before making any assertion. No check may match against raw file text.

#### Scenario: A stylesheet cannot be parsed

- **WHEN** a shipped stylesheet cannot be parsed into that shape
- **THEN** the check fails with a parse error naming the file
- **AND** it does not fall back to matching raw text, which would let a malformed
  stylesheet pass as if it were correct

### Requirement: Actions share one register

Every control that acts when activated — buttons of any variant — SHALL take its
shape, focus ring, transition and inert state from one shared register, so those
are not decisions each variant makes for itself. The inert state SHALL be
declared in the utilities layer, after the variant colours, so that it wins
against them and against hover.

#### Scenario: Two variants sit side by side

- **WHEN** a primary and a ghost button are rendered next to each other
- **THEN** they present the same radius, the same border geometry, the same
  transition and the same focus ring
- **AND** only their colours and their box size differ

#### Scenario: A variant declares its own focus ring

- **WHEN** a variant sets a focus indicator of its own instead of using the
  register
- **THEN** the enforcement check fails and names the variant

#### Scenario: Reduced motion is preferred

- **WHEN** the person prefers reduced motion
- **THEN** the busy indicator does not animate at all, rather than animating at
  a duration too short to see

### Requirement: A control below the touch target restores it

The registers SHALL provide a way for a control whose visible box is smaller than
44 pixels to present a 44 by 44 activation area without changing its appearance.

#### Scenario: A small control is tapped near its edge

- **WHEN** a pointer or a touch lands within 44 pixels of the control's centre
  but outside its visible box
- **THEN** the control is activated

#### Scenario: A small control sits beside another

- **WHEN** two small controls are placed next to each other
- **THEN** the restored areas do not steal activation from a neighbouring
  control's own visible box

### Requirement: Every class a component wears compiles

The package SHALL prove, by compiling its stylesheets the way a consumer's
Tailwind does, that every class name a component or a class map uses produces a
rule. A literal class name that Tailwind does not know is a defect, not a
no-op.

#### Scenario: A component wears a class the theme does not define

- **WHEN** a component uses a utility whose namespace was nulled and not
  remapped
- **THEN** the compiled-class check fails and names the class

#### Scenario: The cascade is decided in the stylesheet, not by luck

- **WHEN** the compiled stylesheet is read
- **THEN** the action register's inert rule appears after every hover utility
  the class maps use

### Requirement: The focus ring survives forced colours and clipping

The shared focus ring SHALL be drawn with `outline` and `outline-offset`, from
the focus token, and SHALL NOT rely on `box-shadow` or set `outline: none`.

#### Scenario: A control is focused in forced-colours mode

- **WHEN** the operating system forces colours
- **THEN** the ring is still drawn, because outlines are kept and shadows are
  not

### Requirement: Controls and actions opt out of the tap delay

The control and action registers SHALL set `touch-action: manipulation`.

#### Scenario: A button is tapped on a touch device

- **WHEN** a button or control is tapped
- **THEN** the browser does not wait for a possible double-tap before acting
