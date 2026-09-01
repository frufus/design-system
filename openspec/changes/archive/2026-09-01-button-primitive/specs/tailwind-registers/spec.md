## ADDED Requirements

### Requirement: Actions share one register

Every control that acts when activated — buttons of any variant — SHALL take its
shape, focus ring, transition and inert state from one shared register, so those
are not decisions each variant makes for itself.

#### Scenario: Two variants sit side by side

- **WHEN** a primary and a ghost button are rendered next to each other
- **THEN** they present the same radius, the same border geometry, the same
  transition and the same focus ring
- **AND** only their colours and their box size differ

#### Scenario: A variant declares its own focus ring

- **WHEN** a variant sets a focus indicator of its own instead of using the
  register
- **THEN** the enforcement check fails and names the variant

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
