# form-field Specification

## Purpose

Defines what a labelled control guarantees: that its label names it, that its
description and its error reach assistive technology, and what happens when a
project supplies both or neither.

## Requirements

### Requirement: Every field has a label that names it

A field SHALL render a label associated with its control, and the control's
accessible name SHALL be that label.

#### Scenario: A project supplies a label

- **WHEN** a field renders with a label
- **THEN** activating the label moves focus to the control
- **AND** assistive technology reports the control by that label

#### Scenario: A project supplies no identifier

- **WHEN** a field renders without an explicit identifier
- **THEN** the component generates one
- **AND** two fields on the same page never share it

### Requirement: A description is announced with the control

A field's description SHALL be reachable from the control rather than only
visible beside it.

#### Scenario: A field has a description

- **WHEN** a field renders with a description
- **THEN** the control references it
- **AND** the reference resolves to an element that exists in the document

#### Scenario: A field has no description

- **WHEN** a field renders without one
- **THEN** the control carries no dangling reference to a description

### Requirement: An error is announced without replacing the description

When a field is in error, the control SHALL report itself invalid and reference
both its error and its description, in that order.

#### Scenario: A field has an error and a description

- **WHEN** both are present
- **THEN** the control reports itself invalid
- **AND** it references the error first and the description second, so the
  problem is heard before the explanation

#### Scenario: An error appears on a field that already has a description

- **WHEN** an error is added to a field that has a description
- **THEN** the description is still referenced
- **AND** it is still visible

#### Scenario: The error is conveyed by more than colour

- **WHEN** a field is in error
- **THEN** the message carries text, and an icon accompanies it
- **AND** the state is discernible without perceiving colour

### Requirement: A disabled field is inert and announced

A disabled field SHALL refuse focus and input, report its state to assistive
technology, and communicate it with dedicated colours rather than transparency.

#### Scenario: A field is disabled

- **WHEN** a field renders disabled
- **THEN** its control cannot receive focus or a value
- **AND** assistive technology reports it as unavailable

#### Scenario: A disabled field is rendered in either appearance

- **WHEN** a disabled field renders
- **THEN** its colours come from the tokens dedicated to the disabled state
- **AND** its text clears the 3:1 floor against its own background in both
  appearances

### Requirement: A field owns none of its words

Every string a person reads in a field SHALL come from the consuming project.

#### Scenario: A field renders in a project with a language of its own

- **WHEN** a project supplies the label, the description and the error
- **THEN** those are the only words the field shows
- **AND** the component contributes nothing to translate

### Requirement: Attributes and listeners reach the control

A field SHALL forward every attribute and listener it does not declare as a prop
to its control, except `class` and `style`, which SHALL apply to the field's
root.

#### Scenario: A project sets a platform attribute

- **WHEN** a field is given `placeholder`, `name`, `autocomplete` or `required`
- **THEN** the attribute is present on the control, not on the wrapper

#### Scenario: A project listens to the control

- **WHEN** a field is given a `blur` or `focus` listener
- **THEN** the listener fires when the control loses or gains focus

#### Scenario: A project places the field

- **WHEN** a field is given `class` or `style`
- **THEN** they apply to the field's root, so layout classes position the whole
  field

### Requirement: An error is announced when it appears

A field's error message SHALL be inside a polite live region that exists before
the error does, so an error that appears after a submit is read without moving
focus.

#### Scenario: An error appears

- **WHEN** a field without an error is given one
- **THEN** the message is rendered inside a live region that was already in
  the document
- **AND** the region is empty while there is no error
