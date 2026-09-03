// Proves the distribution story against what is actually published.
//
//   npm run test:consumer
//
// The package ships .vue source rather than a bundle, which means the consumer's
// Tailwind does the compiling. That moves the failure modes into their build - a
// missing entry in `files`, a broken `exports` map, a wrong `@source` path - and
// every one of them fails silently: unstyled output, successful exit, no error.
// Nothing that runs inside this repository can see any of it.
//
// So this packs a tarball and installs it. Not a path install: npm links that,
// and a link lets the fixture see the working tree including the files the
// published contents exclude - which is exactly the failure worth catching.
//
// It needs the network for the fixture's own dependencies and takes far longer
// than every other check combined, which is why it is its own command. A gate
// nobody runs protects nothing, so it is named in CLAUDE.md and in the design
// language as the check that matters most.

import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

// Windows needs a shell to launch npm.cmd, and a shell means quoting anything
// that could contain a space - a temporary directory path, most of all.
const onWindows = process.platform === 'win32'
const quote = (arg) => (onWindows && /[\s"]/.test(arg) ? `"${arg}"` : arg)

const run = (command, args, cwd) =>
  execFileSync(command, args.map(quote), {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: onWindows,
  })

/** The four lines the documentation gives a consuming project, unaltered. */
const WIRING = `@import 'tailwindcss';
@source '../node_modules/@frufus/design-system/src';
@import '@frufus/design-system/tokens.css';
@import '@frufus/design-system/registers.css';
`

const APP = `import { createApp, h } from 'vue'
import { Badge, Button, Card, Dialog, EmptyState, Input, Select } from '@frufus/design-system'
import './app.css'

// Every primitive, so a missing export or an unresolvable path fails the build
// rather than waiting for the screen that happens to use it.
createApp({
  render: () =>
    h('div', [
      h(Button, { variant: 'primary' }, () => 'Save changes'),
      h(Input, { label: 'Workspace name', modelValue: 'Studio' }),
      h(Select, { label: 'Appearance', modelValue: 'system' }, () => h('option', 'Follow')),
      h(Card, { interactive: true }, () => 'Open'),
      h(Badge, { tone: 'success', mark: true }, () => 'Verified'),
      h(EmptyState, { title: () => 'Nothing yet' }, { title: () => 'Nothing yet' }),
      h(Dialog, { open: false, title: 'Confirm', closeLabel: 'Close' }, () => 'Body'),
    ]),
}).mount('#app')
`

/** What the built CSS has to contain for the wiring to have actually worked. */
const REQUIRED = [
  { what: 'a design token', pattern: /--fds-accent:/ },
  { what: 'the control register', pattern: /\.fds-control\b/ },
  { what: 'the action register', pattern: /\.fds-action\b/ },
  { what: 'a claimed colour utility', pattern: /\.bg-accent\b/ },
  { what: 'a claimed ink utility', pattern: /\.text-ink\b/ },
  { what: 'the vendored typeface', pattern: /Atkinson Hyperlegible/ },
]

/** Tailwind defaults that must not have come back. */
const FORBIDDEN = [
  { what: 'a Tailwind default red', pattern: /\.text-red-500\b/ },
  { what: 'a Tailwind default slate', pattern: /\.bg-slate-\d/ },
]

function main() {
  const work = mkdtempSync(join(tmpdir(), 'fds-consumer-'))
  console.log(`consumer fixture: ${work}\n`)

  try {
    console.log('packing the published contents...')
    const packed = run(npm, ['pack', '--pack-destination', work], root).trim().split('\n').pop()
    const tarball = join(work, packed)
    console.log(`  ${packed}\n`)

    const app = join(work, 'app')
    mkdirSync(join(app, 'src'), { recursive: true })

    writeFileSync(
      join(app, 'package.json'),
      JSON.stringify(
        {
          name: 'fds-consumer-fixture',
          private: true,
          type: 'module',
          scripts: { build: 'vite build' },
        },
        null,
        2,
      ),
    )
    writeFileSync(
      join(app, 'vite.config.js'),
      `import { defineConfig } from 'vite'\n` +
        `import vue from '@vitejs/plugin-vue'\n` +
        `import tailwind from '@tailwindcss/vite'\n\n` +
        `export default defineConfig({ plugins: [vue(), tailwind()] })\n`,
    )
    writeFileSync(
      join(app, 'index.html'),
      '<div id="app"></div><script type="module" src="/src/main.js"></script>',
    )
    writeFileSync(join(app, 'src', 'app.css'), WIRING)
    writeFileSync(join(app, 'src', 'main.js'), APP)

    console.log('installing the tarball, as a project would...')
    run(
      npm,
      [
        'install',
        '--no-audit',
        '--no-fund',
        tarball,
        'vue',
        'vite',
        '@vitejs/plugin-vue',
        '@tailwindcss/vite',
        'tailwindcss',
      ],
      app,
    )

    console.log('building...')
    run(npm, ['run', 'build'], app)

    const assets = join(app, 'dist', 'assets')
    const cssFiles = readdirSync(assets).filter((name) => name.endsWith('.css'))
    if (cssFiles.length === 0) throw new Error('the build produced no stylesheet at all')

    const css = cssFiles.map((name) => readFileSync(join(assets, name), 'utf8')).join('\n')
    console.log(`\nbuilt stylesheet: ${css.length} bytes\n`)

    const problems = []
    for (const { what, pattern } of REQUIRED) {
      const found = pattern.test(css)
      console.log(`  ${found ? 'present ' : 'MISSING '} ${what}`)
      if (!found) problems.push(`${what} is missing from the built stylesheet`)
    }
    for (const { what, pattern } of FORBIDDEN) {
      const found = pattern.test(css)
      console.log(`  ${found ? 'PRESENT ' : 'absent  '} ${what}`)
      if (found) problems.push(`${what} survived the nulling`)
    }

    // A font the package references but does not publish is the failure a linked
    // install would hide, so check the file really arrived.
    const fonts = join(app, 'node_modules', '@frufus', 'design-system', 'src', 'fonts')
    const hasFonts = existsSync(fonts) && readdirSync(fonts).some((f) => f.endsWith('.woff2'))
    console.log(`  ${hasFonts ? 'present ' : 'MISSING '} the vendored font files`)
    if (!hasFonts) problems.push('the font files are not in the published contents')

    if (problems.length > 0) {
      console.error('\nThe installed package does not work as documented:\n')
      for (const problem of problems) console.error(`  - ${problem}`)
      process.exit(1)
    }

    console.log('\nThe documented four-line wiring works against a real install.')
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

main()
