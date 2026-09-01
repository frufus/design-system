## Purpose

Defines what the presentational primitives guarantee: that a status tone is
legible and not conveyed by colour alone, that a card which acts is a real
control, and that none of them contributes a word a project would have to
translate.

## ADDED Requirements

### Requirement: A tone is legible in both appearances

A badge SHALL pair each tone with ink chosen for that tone's own fill, meeting
the 4.5:1 text floor in both appearances.

#### Scenario: Every tone is rendered

- **WHEN** each documented tone renders
- **THEN** its text clears 4.5:1 against its own fill in both appearances

#### Scenario: An unknown tone is supplied

- **WHEN** a value outside the documented tones is supplied
- **THEN** the badge renders in its neutral tone rather than unstyled

### Requirement: A status is never colour alone

Where a badge reports a status rather than labelling a category, the status
SHALL be discernible without perceiving colour.

#### Scenario: A status badge renders

- **WHEN** a badge is given a status tone
- **THEN** its text names the status
- **AND** any status mark beside the text is hidden from assistive technology,
  because the text already says it

#### Scenario: The page is viewed in greyscale

- **WHEN** colour is unavailable
- **THEN** the status remains readable from the text

### Requirement: A card that acts is a real control

A card the whole of which responds to activation SHALL be a control, not a
decorated container.

#### Scenario: A keyboard user reaches an interactive card

- **WHEN** a keyboard user tabs through a page containing one
- **THEN** the card receives focus
- **AND** it shows the same focus ring every other control shows

#### Scenario: An interactive card is activated by keyboard

- **WHEN** it is activated with Enter or Space
- **THEN** it emits the same activation a pointer produces

#### Scenario: A card only presents content

- **WHEN** a card is not interactive
- **THEN** it is not focusable and exposes no control semantics

### Requirement: Depth is a surface, never a shadow

A raised or interactive surface SHALL express its state through fill and border,
so it reads the same on a light ground and a near-black one.

#### Scenario: An interactive card is hovered or focused

- **WHEN** it is hovered or focused
- **THEN** its state shows as a change of fill and edge
- **AND** no shadow is used in either appearance

### Requirement: The presentational primitives own no words

Every string a person reads in a card, a badge or an empty state SHALL come
from the consuming project.

#### Scenario: An empty state renders

- **WHEN** a project supplies its title, its explanation and its action
- **THEN** those are the only words shown
- **AND** the component contributes nothing to translate

#### Scenario: An empty state has nothing to offer

- **WHEN** a project supplies no action
- **THEN** the empty state renders without one rather than inventing a default
