## 1. What the component owns

- [x] 1.1 Write `tests/dialog.test.ts`: it renders a `dialog` element, opens
      through the platform's modal mechanism, closes on the platform's cancel,
      emits a dismissal for Escape and for the backdrop, stays open for a click
      inside the panel, and names and describes itself with references that
      resolve.
      **Verified by:** `npm run test -- dialog` — every case fails for want of a
      component.
- [x] 1.2 Implement `src/components/Dialog.vue` until 1.1 is green.
      **Verified by:** the same run.
- [x] 1.3 Assert that it refuses to open rather than falling back when the modal
      mechanism is unavailable.
      **Verified by:** a test that removes the method and expects a throw naming
      the cause.

## 2. Catalog and accessibility

- [x] 2.1 Write stories in both appearances, including a destructive
      confirmation, and note the top-layer behaviour.
      **Verified by:** the catalog builds and the stories are indexed.
- [x] 2.2 Extend the axe suite to the dialog's markup, saying plainly that the
      modal behaviour itself is the browser's.
      **Verified by:** `npm run test -- a11y` reports no violations.

## 3. Export and close

- [x] 3.1 Export `Dialog`; assert the public surface.
      **Verified by:** `npm run test -- public-api`.
- [x] 3.2 Full gate.
      **Verified by:** all green, each on its own exit code.
