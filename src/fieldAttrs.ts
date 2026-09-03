/**
 * Where a field's fallthrough attributes go.
 *
 * A field is a wrapper around a control, and the two want different things
 * from what a project writes on the component. `class` and `style` are how a
 * field is placed in a layout, so they belong to the root. Everything else -
 * `placeholder`, `name`, `autocomplete`, `required`, a `blur` listener - is
 * about the control, which is the only place a placeholder ever renders.
 *
 * Called at render time rather than wrapped in a computed: Vue's attrs object
 * is not reactive, and a computed over it would remember the first render.
 */
export interface SplitAttrs {
  root: Record<string, unknown>
  control: Record<string, unknown>
}

export function splitFieldAttrs(attrs: Record<string, unknown>): SplitAttrs {
  const { class: className, style, ...control } = attrs
  const root: Record<string, unknown> = {}
  if (className !== undefined) root['class'] = className
  if (style !== undefined) root['style'] = style
  return { root, control }
}
