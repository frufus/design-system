## MODIFIED Requirements

### Requirement: A disabled button is inert and says so

A disabled button SHALL leave the tab order, emit nothing when activated, and
report itself unavailable. Its appearance SHALL be the dedicated inert colours
in every variant and both appearances, and SHALL NOT respond to hover.

#### Scenario: A disabled button is activated

- **WHEN** a disabled button is clicked or receives Enter
- **THEN** nothing is emitted

#### Scenario: A disabled button is reached by keyboard

- **WHEN** a keyboard user tabs through the page
- **THEN** the disabled button is skipped, as a native disabled button is

#### Scenario: A filled variant is disabled or working

- **WHEN** a primary, secondary or destructive button is disabled or loading
- **THEN** it wears the inert surface and ink rather than its variant colours
- **AND** hovering it changes nothing

#### Scenario: Both appearances

- **WHEN** a disabled button is rendered in light and in dark
- **THEN** its label clears the non-text floor against its surface in both
