## Context

See `proposal.md` — Why. This follows the `[pattern]` decisions from Button and
the wiring from the form primitives: the same `FieldShell`, the same control
register, every word from the project.

It also deliberately breaks the package's own "use the platform" rule, and that
needs saying out loud: there is no platform primitive for a searchable single
choice. `<select>` cannot search, and `<datalist>` is a suggestion list whose
presentation and keyboard behaviour differ across engines and whose options
cannot be styled or marked as chosen. So this is the one component that
implements a pattern rather than delegating it - which is why it is alone in its
change, specified case by case, and tested case by case.

## Goals / Non-Goals

**Goals:**

- The keyboard behaviour of the ARIA combobox pattern, complete rather than
  approximate.
- Focus that never leaves the text field.
- A value that is always an option or nothing.

**Non-Goals:**

- No multiple selection, free text, remote loading or inline completion. All in
  the proposal.

## Decisions

### `aria-activedescendant`, not roving focus

Focus stays in the text field; the active option is named by reference. That is
what lets the person keep typing while moving through matches - roving focus
would move focus out of the field on the first arrow key and stop the typing.

_Alternative rejected:_ moving DOM focus into the list. Simpler to write, and it
breaks the one interaction the component exists for.

### No inline completion

The input is not overwritten with the remainder of a match as you type. Inline
completion means selecting text the person did not type, which fights every
backspace, behaves badly with composition input for languages that need it, and
is the reason `aria-autocomplete="both"` is so often implemented wrongly.

`aria-autocomplete="list"` is what this does, and it says so.

### Escape twice: close, then clear

The first Escape closes the list and keeps the value; the second clears the field
and unsets the value. This is what the pattern specifies, and it gives a person
an escape route from both the list and the choice without reaching for the mouse.

### Blur restores rather than commits

Leaving the field puts the text back to the chosen option. A combobox that
committed the typed text on blur would produce values that are not options, which
the spec forbids - and it would do so silently.

### The count is announced, and the project supplies the words

A live region with a bare number announces "forty" into the void. So the region
takes a slot that receives the count, and stays empty when the project gives it
nothing - which is the honest behaviour for a package that owns no words rather
than inventing an English string.

### Filtering is a substring match, and replaceable

Case-insensitive substring by default, because prefix-only matching is the thing
people notice as broken about native select typeahead. A project can pass its own
matcher - fuzzy, accent-folding, whatever its data needs.

## Risks / Trade-offs

- **This is the largest accessibility surface in the package.** → Alone in its
  change, specified case by case, and tested case by case. It is also the reason
  `Select` was built first and stays: for a short list of known values a native
  select is still the better answer, and the design language says so in both
  directions.

- **A pattern implemented by hand drifts from the specification over time.** →
  The keyboard behaviour is written as scenarios in the capability spec rather
  than as comments, so a future change that breaks one has to argue with a
  requirement rather than with a test name.

- **Long lists render every matching option.** → Acceptable for the lists this
  package is for. Virtualisation would change the DOM contract that
  `aria-activedescendant` depends on, and is a separate decision with its own
  accessibility cost.
