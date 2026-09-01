## MODIFIED Requirements

### Requirement: A consuming project wires the package in four lines

The package SHALL be usable through exactly four CSS lines: the Tailwind import,
a source declaration covering the package's own files, and the two package
stylesheets. Changing this contract is a breaking change.

The claim SHALL be proven against a real installation of the published contents,
not against the repository's own files.

#### Scenario: A project follows the documented wiring

- **WHEN** a project imports Tailwind, declares the package directory as a source,
  and imports the two package stylesheets
- **THEN** the primitives render fully styled
- **AND** no further configuration file is required

#### Scenario: The source declaration is omitted

- **WHEN** a project imports the two stylesheets but does not declare the package
  directory as a source
- **THEN** the primitives render unstyled, because Tailwind does not scan
  installed dependencies for class names by default
- **AND** this symptom and its cause are documented, since the page renders
  without raising any error

#### Scenario: The published contents are installed and built

- **WHEN** the package is packed, installed into an application, wired with the
  four lines, and built
- **THEN** the build succeeds
- **AND** the output carries the tokens, the shared registers and the utilities
  the package claims
- **AND** no Tailwind default colour appears in the output

#### Scenario: A file the package needs is left out of what is published

- **WHEN** a file the package references is missing from the published contents
- **THEN** the installed build fails or its output lacks what that file provides
- **AND** the failure is reported against the package rather than discovered by a
  consuming project
