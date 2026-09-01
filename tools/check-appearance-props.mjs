// Fails when a component or a story declares a prop that hands it the
// appearance. Appearance is set once on the document and every component follows
// without knowing it happened; a component that can be *told* which appearance
// it is in has been given the chance to branch on it, and that branch is what
// the token architecture exists to remove.
//
//   node tools/check-appearance-props.mjs
//
// Runs as part of `npm run lint`.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const SCANNED_DIRECTORIES = ['src', 'stories']
const SCANNED_EXTENSIONS = new Set(['.vue', '.ts'])

const FORBIDDEN = ['theme', 'appearance', 'mode', 'darkMode', 'isDark']

// Only a property *declaration* counts: `name:` or `name?:` in a props type or
// object. The bare word in a comment, a class name or a CSS selector is not a
// prop and must not be reported, because a check that cries wolf gets switched
// off and then protects nothing.
const PATTERNS = FORBIDDEN.map((name) => ({
  name,
  pattern: new RegExp(`(?:^|[{,;]|\\bprops\\s*:\\s*\\{)\\s*${name}\\??\\s*:`, 'm'),
}))

export function findAppearanceProps(text) {
  return PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ name }) => name)
}

function* walk(dir) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }

  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'fonts') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      yield* walk(full)
      continue
    }
    if (SCANNED_EXTENSIONS.has(extname(entry))) yield full
  }
}

/** @returns {{file: string, line: number, matches: string[]}[]} */
export function scanForAppearanceProps(root) {
  const offences = []

  for (const directory of SCANNED_DIRECTORIES) {
    for (const file of walk(join(root, directory))) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, index) => {
        const matches = findAppearanceProps(line)
        if (matches.length > 0) {
          offences.push({
            file: relative(root, file).split('\\').join('/'),
            line: index + 1,
            matches,
          })
        }
      })
    }
  }

  return offences
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const offences = scanForAppearanceProps(process.cwd())

  if (offences.length === 0) {
    console.log('no component takes its appearance as a prop')
    process.exit(0)
  }

  console.error(
    'Appearance is set on the document, not handed to a component.\n' +
      'These declare it as a prop, which lets the component branch on it:\n',
  )
  for (const offence of offences) {
    console.error(`  ${offence.file}:${offence.line}  ${offence.matches.join(', ')}`)
  }
  process.exit(1)
}
