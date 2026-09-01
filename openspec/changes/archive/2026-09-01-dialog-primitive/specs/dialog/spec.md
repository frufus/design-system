## Purpose

Defines what a modal dialog guarantees: where focus goes when it opens, what can
close it, where focus returns, and that the page behind it cannot be reached
while it is open.

## ADDED Requirements

### Requirement: An open dialog holds focus

While a dialog is open, focus SHALL be confined to it and the rest of the page
SHALL be unreachable by keyboard or pointer.

#### Scenario: A dialog opens

- **WHEN** a dialog opens
- **THEN** focus moves into it
- **AND** it lands on the close action unless the project declares another
  starting point

#### Scenario: A keyboard user tabs past the last control

- **WHEN** focus is on the dialog's last focusable element and the user tabs
- **THEN** focus returns to the first element inside the dialog

#### Scenario: A user tries to reach the page behind

- **WHEN** the page behind the dialog is clicked or tabbed to
- **THEN** nothing behind the dialog takes focus or responds

### Requirement: A dialog can always be left

A dialog SHALL close on Escape and on activating its backdrop, and both SHALL
mean cancel.

#### Scenario: Escape is pressed

- **WHEN** Escape is pressed while the dialog is open
- **THEN** the dialog closes
- **AND** it reports that it was dismissed rather than confirmed

#### Scenario: The backdrop is activated

- **WHEN** the area outside the dialog's panel is activated
- **THEN** the dialog closes and reports the same dismissal

#### Scenario: The panel itself is activated

- **WHEN** a click lands inside the dialog's panel
- **THEN** the dialog stays open

### Requirement: Focus returns where it started

Closing a dialog SHALL return focus to the element that opened it, whichever
route the dialog was closed by.

#### Scenario: A dialog closes

- **WHEN** a dialog closes for any reason
- **THEN** focus returns to the element that opened it

### Requirement: A dialog is named and described by its own content

A dialog SHALL take its accessible name from its title and its description from
its body, referencing each by an identifier that resolves to a rendered element.

#### Scenario: A dialog with a title and a body opens

- **WHEN** it renders
- **THEN** its accessible name is its title
- **AND** its description is its body, referenced by an identifier that resolves

#### Scenario: A dialog has no body

- **WHEN** only a title is supplied
- **THEN** no dangling description reference is left behind

### Requirement: The modal behaviour is the platform's

The component SHALL delegate trapping, inertness and focus restoration to the
browser rather than reimplementing them, and SHALL refuse to open rather than
present a dialog that looks modal and is not.

#### Scenario: The platform provides modal dialogs

- **WHEN** the dialog opens
- **THEN** it is opened through the platform's modal mechanism

#### Scenario: The platform does not provide them

- **WHEN** the modal mechanism is unavailable
- **THEN** the component reports the problem rather than opening a dialog that
  traps nothing
