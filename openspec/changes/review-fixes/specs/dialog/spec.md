## ADDED Requirements

### Requirement: The close action is named by the project

The close button SHALL carry an accessible name supplied by the consuming
project through a required `closeLabel` prop. A dialog without one SHALL fail
to typecheck rather than render an unnamed control.

#### Scenario: A project supplies the name

- **WHEN** a dialog renders with a `closeLabel`
- **THEN** the close button reports that label as its name
- **AND** the label is not painted beside the icon

### Requirement: A close is reported once

Whichever route closes the dialog - the close button, the backdrop, Escape, or
the platform - the dialog SHALL emit `update:open` exactly once per close.

#### Scenario: The close button is activated

- **WHEN** the close button is clicked
- **THEN** the dialog reports one dismissal and one `update:open`

#### Scenario: A drag ends on the backdrop

- **WHEN** a pointer goes down inside the panel and is released over the
  backdrop
- **THEN** the dialog stays open, because that is a selection, not a dismissal

## MODIFIED Requirements

### Requirement: A description that is gone is not referenced

The dialog SHALL reference its body as its description only while the body is
rendered, including when the body slot appears or disappears after mount.

#### Scenario: The body slot is withdrawn

- **WHEN** a project stops supplying the body slot of an open dialog
- **THEN** the dialog no longer carries an `aria-describedby`
