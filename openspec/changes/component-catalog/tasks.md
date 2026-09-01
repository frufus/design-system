## 1. Install and configure

- [x] 1.1 Add Storybook 9 for Vue 3 with Vite, plus `@storybook/addon-a11y`, as
      development dependencies, and write `.storybook/main.ts` pointing at
      `stories/`.
      **Verified by:** `npm run build:storybook` completes and writes
      `storybook-static/index.html`.
- [x] 1.2 Add `npm run dev` and `npm run build:storybook`, and confirm the
      published package is unaffected.
      **Verified by:** `npm pack --dry-run` still reports 7 files.

## 2. Wire the package the way a consumer does

- [x] 2.1 Write `.storybook/preview.css` with the documented four lines - the
      Tailwind import, the `@source` declaration, and both package stylesheets -
      and register the Tailwind Vite plugin in the Storybook Vite config.
      **Verified by:** a test asserts the preview stylesheet contains all four
      directives and that its `@source` resolves to a directory that exists.
- [x] 2.2 Import the preview stylesheet from `.storybook/preview.ts`.
      **Verified by:** the built catalog's CSS contains a `--fds-` token
      declaration and at least one utility class the register claims.

## 3. Both appearances, one toolbar

- [x] 3.1 Add a global `appearance` type that writes `data-theme` onto the
      preview document's root element, defaulting to the system preference.
      **Verified by:** a test asserts the preview config declares the global and
      that setting it writes the attribute rather than wrapping the story.
- [x] 3.2 Confirm no story receives an appearance as a prop.
      **Verified by:** the enforcement check gains a rule that fails when a story
      or component takes a `theme` or `appearance` prop.

## 4. One story that proves the pipeline

- [x] 4.1 Write a story rendering bare markup carrying `.fds-control`, with the
      a11y addon active.
      **Verified by:** the catalog builds and the story appears in
      `storybook-static/index.json`.

## 5. Close the change

- [x] 5.1 Run the full suite, lint, typecheck, format and the catalog build.
      **Verified by:** all green, each on its own exit code.
- [x] 5.2 Update `CLAUDE.md` commands.
      **Verified by:** every command listed there runs.
