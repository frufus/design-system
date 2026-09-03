## ADDED Requirements

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
