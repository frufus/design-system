## Why

`Select` renders a native `<select>`, deliberately: the platform's option list is
better than a hand-rolled one and every mobile user already knows it. That
decision was made with a named condition — it holds while the list is short
enough to scroll and the value is chosen rather than searched for.

A list of two hundred paints is neither. Once a person needs to type to narrow
the options, a native select stops serving them: it has no search, its typeahead
matches only a prefix, and it cannot show that forty of two hundred options
matched.

This is also the component the design canvas actually drew. The open list with a
checked row was set aside when Select was built, with the reason recorded and the
promise that it was the specification for this. That promise comes due here.

## What Changes

- **New:** `src/components/Combobox.vue` — a text input that filters a list, with
  the full keyboard behaviour the pattern requires: arrows to move, Home and End,
  Enter to choose, Escape to close and then to clear, Tab to leave.
- **New:** the open list from the canvas, at last: a panel of options with the
  chosen one marked by a check and a soft fill, not by colour alone.
- **New:** a live region reporting how many options matched — worded by the
  consuming project, because this package owns no words.
- **New:** stories and tests, including the keyboard behaviour in full.

**User-visible outcome:** a project can offer a searchable choice without
building the listbox, and without getting the keyboard behaviour subtly wrong.

### Non-Goals

- **No multiple selection.** Chips, removal, and the announcement of both are a
  larger component; naming it here would be a promise this change does not keep.
- **No free text.** The value is one of the options or nothing. A combobox that
  also accepts arbitrary input has a different contract about what its value
  means.
- **No remote loading.** Filtering is over the options given. A project that
  fetches passes a new list and says how many matched.
- **No inline completion.** The input is not overwritten with the rest of a match
  as you type. See the design for why.
- **`Select` is not deprecated.** For a short list of known values it remains the
  better answer, and this change says so in both directions.

## Capabilities

### New Capabilities

- `combobox`: what a searchable choice guarantees — how it is driven from the
  keyboard, what it announces, and what its value means.

### Modified Capabilities

None. `Select` keeps its contract; this adds a second one beside it.

## Impact

- **New files:** the component, its stories and tests.
- **Consumers:** one more export.
- **Dependencies:** none. The pattern is implemented against the ARIA
  specification rather than pulled in.
- **Risk:** this is the largest accessibility surface in the package, which is
  exactly why it was not bundled into a five-component change. The keyboard
  behaviour is specified case by case and tested case by case.
