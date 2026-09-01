## Purpose

Defines what a searchable choice guarantees: how it is driven from the keyboard,
what assistive technology is told as the list narrows, what its value means, and
when a project should reach for it rather than for a plain select.

## ADDED Requirements

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
with focus remaining in the text field throughout.

#### Scenario: The list is closed and the person presses Down

- **WHEN** Down is pressed on a closed list
- **THEN** the list opens with the first option active

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
