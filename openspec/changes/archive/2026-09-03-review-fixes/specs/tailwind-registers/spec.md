## ADDED Requirements

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

## MODIFIED Requirements

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
