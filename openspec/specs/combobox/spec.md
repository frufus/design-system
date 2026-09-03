# combobox Specification

## Purpose

Defines what a searchable choice guarantees: how it is driven from the keyboard,
what assistive technology is told as the list narrows, what its value means, and
when a project should reach for it rather than for a plain select.

## Requirements

### Requirement: Typing narrows the list

The component SHALL filter its options as the person types and SHALL open the
list when filtering begins.

#### Scenario: A person types

- **WHEN** text is entered
- **THEN** only the options matching it are offered
- **AND** the list is open

#### Scenario: Nothing matches

- **WHEN** no option matches the text
- **THEN** the list stays open and says so in the project's own words
- **AND** no option is active, so pressing Enter chooses nothing

#### Scenario: The text is cleared

- **WHEN** the text is emptied
- **THEN** every option is offered again

### Requirement: The whole choice is reachable from the keyboard

The component SHALL support the full set of keys the combobox pattern defines,
with focus remaining in the text field throughout. Opening from the keyboard
SHALL respect the text already typed.

#### Scenario: The list is closed and the person presses Down

- **WHEN** Down is pressed on a closed list
- **THEN** the list opens with the first option active

#### Scenario: Up is pressed on a closed list with text in the field

- **WHEN** the field holds text that narrows the options and Up is pressed
- **THEN** the list opens with the last match active, not the last option

#### Scenario: The person moves past the last option

- **WHEN** Down is pressed while the last option is active
- **THEN** the first option becomes active

#### Scenario: The person moves before the first option

- **WHEN** Up is pressed while the first option is active
- **THEN** the last option becomes active

#### Scenario: The person jumps to an end

- **WHEN** Home or End is pressed with the list open
- **THEN** the first or the last option becomes active

#### Scenario: The person chooses

- **WHEN** Enter is pressed while an option is active
- **THEN** that option becomes the value, the list closes, and the text shows the
  chosen option

#### Scenario: The person leaves without choosing

- **WHEN** Escape is pressed with the list open
- **THEN** the list closes and the value is unchanged

#### Scenario: The person presses Escape again

- **WHEN** Escape is pressed with the list already closed
- **THEN** the text is cleared and the value is unset

#### Scenario: The person tabs away

- **WHEN** focus leaves the component
- **THEN** the list closes and the text returns to the chosen option, or to empty
  if nothing is chosen

### Requirement: The active option is announced without moving focus

Focus SHALL remain in the text field while the list is open, and the active
option SHALL be conveyed to assistive technology by reference rather than by
moving focus.

#### Scenario: An option becomes active

- **WHEN** the active option changes
- **THEN** the text field references that option by an identifier that resolves
- **AND** focus is still in the text field

#### Scenario: The list is closed

- **WHEN** the list is closed
- **THEN** no active-option reference remains

### Requirement: The number of matches is announced

The component SHALL report how many options match, in a region assistive
technology announces, worded by the consuming project.

#### Scenario: The list narrows

- **WHEN** filtering changes how many options match
- **THEN** the count is reported in a polite live region
- **AND** the wording comes from the consuming project

#### Scenario: A project supplies no wording

- **WHEN** the project provides no wording for the count
- **THEN** the live region stays empty rather than announcing a number with no
  language around it

### Requirement: The chosen option is marked by more than colour

The option currently chosen SHALL be distinguishable without perceiving colour,
and SHALL be reported as selected to assistive technology.

#### Scenario: The list is open with a value chosen

- **WHEN** the list shows the chosen option
- **THEN** it is marked by a check as well as a fill
- **AND** assistive technology reports it as selected

### Requirement: The value is one of the options, or nothing

The component SHALL NOT produce a value that is not among its options.

#### Scenario: Text is typed that matches no option and focus leaves

- **WHEN** the person types text matching nothing and then leaves
- **THEN** the value is unchanged
- **AND** the text returns to the chosen option, or to empty if none is chosen

#### Scenario: A project supplies a value that is not in the options

- **WHEN** the value does not correspond to any option
- **THEN** the field shows empty text rather than inventing a label for it

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
