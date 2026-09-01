/**
 * How a combobox decides what matches.
 *
 * Separate from the component because it is the only pure part of it: a function
 * from options and text to options, testable without a DOM and replaceable by a
 * project whose data needs something else.
 */

export interface ComboboxOption {
  value: string
  label: string
}

/** Decides whether one option matches the typed text. */
export type ComboboxMatcher = (query: string, option: ComboboxOption) => boolean

/**
 * Case-insensitive, anywhere in the label.
 *
 * Substring rather than prefix on purpose: prefix-only matching is exactly the
 * thing people notice as broken about a native select's typeahead - "red" should
 * find "Mephiston Red".
 */
export const defaultMatcher: ComboboxMatcher = (query, option) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase())

/**
 * Narrows the options to those matching the text, keeping the project's order.
 * Empty or blank text matches everything, because a person who has typed nothing
 * has excluded nothing.
 */
export function filterOptions(
  options: readonly ComboboxOption[],
  query: string,
  matcher: ComboboxMatcher = defaultMatcher,
): ComboboxOption[] {
  if (query.trim() === '') return [...options]
  return options.filter((option) => matcher(query, option))
}
