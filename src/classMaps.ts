/**
 * State to classes, as explicit tables.
 *
 * Nothing here is computed. Every class name appears literally, which is both
 * the project's rule - a class the build sees can be found by searching for it -
 * and how Tailwind works from the other side: a class name assembled from a
 * variable is one its scanner never sees and never emits.
 *
 * These maps hold only what actually varies between buttons: the colours and the
 * box. Shape, focus ring, transition and the inert state come from the action
 * register in `registers.css`, so they are not decisions each variant makes for
 * itself.
 *
 * The colours are the utilities `registers.css` claims, so a consuming project
 * rethemes a button by redefining a token, never by editing this file.
 */

export const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'destructive'] as const
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

export const DEFAULT_BUTTON_VARIANT: ButtonVariant = 'primary'
export const DEFAULT_BUTTON_SIZE: ButtonSize = 'md'

/**
 * Narrows an arbitrary value to a documented key, falling back rather than
 * rendering unstyled. A component that loses its appearance because a value
 * arrived from an API is worse than one that renders plainly.
 */
export function resolveKey<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-ink-on-accent hover:bg-accent-hover active:bg-accent-active',
  secondary:
    'border-border-strong bg-surface text-ink hover:bg-surface-sunken active:border-ink-muted',
  ghost: 'text-accent-ink hover:bg-accent-soft active:border-accent',
  destructive: 'bg-danger text-ink-on-danger hover:bg-danger-hover active:bg-danger-active',
}

export const buttonSizeClasses: Record<ButtonSize, string> = {
  // The visible box is 36; `fds-target` restores the 44 px activation area
  // around it, so density never costs the floor.
  // A step carries a weight and a tracking of its own; the action's follow it
  // as utilities so the step cannot take them.
  sm: 'fds-target h-[var(--fds-control-sm)] px-3 text-xs font-action tracking-action',
  md: 'h-[var(--fds-control-md)] px-4 text-sm font-action tracking-action',
  lg: 'h-[var(--fds-control-lg)] px-5 text-base font-action tracking-action',
}

/** Every button wears both: the register that gives it its shape, and the ring. */
export const buttonBaseClasses = 'fds-action fds-focus-ring'

export const BADGE_TONES = ['neutral', 'accent', 'success', 'warning', 'danger', 'outline'] as const

export type BadgeTone = (typeof BADGE_TONES)[number]

export const DEFAULT_BADGE_TONE: BadgeTone = 'neutral'

/**
 * Each tone names both halves of a pair the contrast suite measures: the soft
 * fill and the ink chosen against it. A soft fill with borrowed ink is the
 * classic way a badge fails its floor in one appearance and passes in the other.
 */
export const badgeToneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-disabled-surface text-ink',
  accent: 'bg-accent-soft text-accent-ink',
  success: 'bg-success-soft text-success-ink',
  warning: 'bg-warning-soft text-warning-ink',
  danger: 'bg-danger-soft text-danger-ink',
  outline: 'border-border-strong text-ink-muted',
}

/**
 * The Console panel. Depth is a fill and an edge, never a shadow: a shadow is
 * invisible on a near-black ground, so this identity never learns to depend on
 * one.
 */
export const cardBaseClasses =
  'block w-full border border-border-strong bg-surface text-left text-ink'

/** An interactive card takes a left bar, not a lift. */
export const cardInteractiveClasses =
  'fds-focus-ring cursor-pointer border-l-[3px] hover:border-l-accent hover:bg-surface-sunken'
