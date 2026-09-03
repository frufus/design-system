## ADDED Requirements

### Requirement: The active option stays in view

When the active option changes, the listbox SHALL scroll so the active option
is visible.

#### Scenario: Arrowing past the visible options

- **WHEN** the list holds more options than fit and the active option moves
  below the visible area
- **THEN** the list scrolls the active option into view

### Requirement: The active state is visible on the chosen option

When the active option is also the chosen one, it SHALL wear the active fill,
and the chosen state SHALL remain discernible by its check mark.

#### Scenario: The chosen option becomes active

- **WHEN** the active option is the one whose value is the model value
- **THEN** the option wears exactly one fill, the active one
- **AND** its check mark is still rendered

### Requirement: The field opens on click

Clicking an enabled combobox field SHALL open the list, so the choice is
reachable by pointer without typing.

#### Scenario: The field is clicked while closed

- **WHEN** the closed field is clicked
- **THEN** the list opens, showing what the current text matches

### Requirement: Escape is claimed only when there is something to leave

A combobox SHALL prevent the default of Escape only when it closes the list or
clears the value. With the list closed and no value, Escape SHALL pass through
untouched, so an enclosing dialog can act on it.

#### Scenario: Escape with nothing to do

- **WHEN** Escape is pressed with the list closed and no value chosen
- **THEN** the event's default is not prevented

### Requirement: Interacting with the list does not close it

A pointer going down on the listbox - including on its scrollbar - SHALL NOT
move focus out of the field, so the list stays open.

#### Scenario: The scrollbar is dragged

- **WHEN** a pointer goes down on the listbox outside any option
- **THEN** the field keeps focus and the list stays open

## MODIFIED Requirements

### Requirement: The whole choice is reachable from the keyboard

The list SHALL open from the keyboard at either end of the current matches, and
walking it SHALL respect the text already typed.

#### Scenario: Up is pressed on a closed list with text in the field

- **WHEN** the field holds text that narrows the options and Up is pressed
- **THEN** the list opens with the last match active, not the last option
