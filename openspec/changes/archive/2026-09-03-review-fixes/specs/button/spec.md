## MODIFIED Requirements

### Requirement: A disabled button is inert and says so

The component SHALL make a disabled button non-activatable and expose that state
to assistive technology, without relying on transparency to communicate it. Its
appearance SHALL be the dedicated inert colours in every variant and both
appearances, and SHALL NOT respond to hover.

#### Scenario: A disabled button is activated

- **WHEN** a disabled button is clicked
- **THEN** no activation is emitted

#### Scenario: A disabled button is rendered in either appearance

- **WHEN** a disabled button renders
- **THEN** its colours come from tokens dedicated to the disabled state rather
  than from a reduced opacity
- **AND** its label meets the 3:1 contrast floor against its own background in
  both appearances

#### Scenario: A filled variant is disabled or working

- **WHEN** a primary, secondary or destructive button is disabled or loading
- **THEN** it wears the inert surface and ink rather than its variant colours
- **AND** hovering it changes nothing
