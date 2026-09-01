# ADR-0001: Token names are the package's public surface

Status: accepted · Date: 2026-09-01 · Affects: change/token-foundation, capability/design-tokens

## Context

The package ships 30 colour tokens per appearance plus 65 non-colour tokens —
95 custom property names in total. Every one of them appears in consuming code:
directly where a project overrides a value on its own `:root`, and indirectly
through the 74 Tailwind utility names the register maps onto them.

That makes the names an interface, not an implementation detail, and it makes
them expensive to change: a rename breaks every consumer at once, silently. CSS
custom properties have no deprecation mechanism. An unknown `--fds-*` on `:root`
does nothing and raises nothing, so a consumer who kept overriding the old name
after a rename gets an interface that quietly stops responding — the worst
failure shape available, because it looks like it worked.

There is no consumer yet. This is the last moment the names are free.

## Decisions

1. **The raw tokens are namespaced `--fds-*`; the utility names are not.**
   Rejected: unprefixed raw tokens, as `Mtg-Commander-builder-` uses
   (`--color-bg`, `--color-ink`). That works there because a single application
   owns its whole namespace. A shared package cannot claim `--color-bg` without
   risking a collision with the consumer's own tokens, and a collision in CSS
   custom properties resolves by cascade order rather than by error. The
   `@theme inline` remap is what lets the raw names stay namespaced while the
   utilities a developer types stay clean — `bg-surface`, not `bg-fds-surface`.

2. **Names describe the role, never the value or the appearance.**
   `--fds-ink`, not `--fds-near-black`; `--fds-surface-sunken`, not
   `--fds-grey-50`. Rejected: a numbered ramp exposed as the public surface
   (`--fds-neutral-100 … --fds-neutral-950`), which is what the palette tool
   uses internally. A ramp step is a fact about a colour; a role is a fact about
   a design. Exposing the ramp would make every consumer's override a guess
   about which step a component happens to use, and would make the two
   appearances impossible to express — `neutral-950` is the darkest ink in one
   and the darkest surface in the other, and that is precisely the flip the role
   names capture.

3. **The pairs `ink-on-accent` and `ink-on-danger` are separate tokens.**
   Rejected: one `ink-on-fill` for both. Signal, one of the rejected identity
   directions, needed dark ink on its accent and light ink on its danger fill
   at the same time; keeping them separate cost one token and kept that possible
   for any future consumer whose accent runs warm.

4. **A rename is a major version and an ADR, never a refactor.**
   Rejected: aliasing the old name to the new one for a transition period. An
   alias is cheap to add and never gets removed, and two names for one role is
   exactly the ambiguity these names exist to prevent. If a name is wrong, it is
   worth a major version.

## Consequences

**Easy.** A consumer rethemes by redefining values on `:root` — no build step,
no JavaScript, no fork. The utility names stay short, so consuming code does not
read like it is using a library. The two appearances are expressible in one set
of names because the names describe roles.

**Hard.** Getting a name wrong is now expensive, and the safety valve — an alias
— is deliberately closed. Adding a role later is cheap; renaming one is not.

**Must stay true.** The `@theme inline` remap must keep pointing at variables
rather than values, or the namespacing buys nothing and runtime retheming stops
working. The appearance-parity check must keep both appearances declaring the
same set of names, because a name that exists in only one is a role that only
half exists.
