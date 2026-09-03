# button Specification

## Purpose

Defines what a button guarantees to the project using it: which states it can be
in, how it behaves for a keyboard and a screen reader while it is working, the
target size it never drops below, and the fact that it contributes no words of
its own.

## Requirements

### Requirement: A button carries no words of its own

The component SHALL take its label from the consuming project. It contains no
user-facing string in any language.

#### Scenario: A project renders a button

- **WHEN** a project supplies label content
- **THEN** that content is what the button shows
- **AND** nothing else in the button is readable text

#### Scenario: A button shows only an icon

- **WHEN** a project renders a button whose visible content is an icon
- **THEN** the project supplies the accessible name
- **AND** the button exposes that name to assistive technology

### Requirement: Every button meets the touch target at every size

The component SHALL present an activation target of at least 44 by 44 pixels in
all three sizes, including the size whose visible box is smaller.

#### Scenario: The small size is used

- **WHEN** the small size renders
- **THEN** its visible box may be smaller than 44 pixels tall
- **AND** the area that responds to a tap or a click is still at least 44 by 44

#### Scenario: A button shows only an icon

- **WHEN** an icon-only button renders
- **THEN** it is at least as wide as it is tall
- **AND** it meets the same target floor

### Requirement: A working button cannot be activated twice

While a button reports that it is working, the component SHALL ignore further
activation, keep the button reachable by keyboard, and keep its label visible.

#### Scenario: A button is activated while it is working

- **WHEN** a button in its working state is clicked or activated by keyboard
- **THEN** no activation is emitted to the consuming project

#### Scenario: A keyboard user reaches a working button

- **WHEN** a keyboard user tabs through a page containing a working button
- **THEN** the button still receives focus
- **AND** assistive technology reports that it is busy

#### Scenario: A button begins working

- **WHEN** a button enters its working state
- **THEN** its label remains visible and unchanged
- **AND** the button's width does not change because of the state

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

### Requirement: State maps to classes through an explicit table

The component SHALL derive its classes from explicit maps. No class name is
assembled from a variable at runtime.

#### Scenario: A variant is rendered

- **WHEN** any variant renders
- **THEN** the class names it produces appear literally in the package's source
- **AND** they can be found by searching for them

#### Scenario: An unknown variant is supplied

- **WHEN** a value outside the documented variants is supplied
- **THEN** the button renders in its default variant rather than unstyled

### Requirement: The focus ring belongs to the system

Every variant SHALL show the same focus indicator, taken from the shared
register rather than declared per variant.

#### Scenario: A button receives keyboard focus

- **WHEN** any variant receives focus from the keyboard
- **THEN** the same focus ring appears
- **AND** it meets the 3:1 non-text contrast floor against the surface behind it

#### Scenario: A button is clicked with a pointer

- **WHEN** a button is activated by pointer
- **THEN** no focus ring is shown, because the indicator is for keyboard
  navigation
