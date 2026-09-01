// Fails when a colour literal appears anywhere in the package except the token
// stylesheet. Tokens are the only source of colour; without a check that is a
// habit reviewers have to remember rather than a rule the build holds.
//
//   node tools/check-literal-colours.mjs
//
// Runs as part of `npm run lint`. ESLint cannot see inside CSS, and a Vue file's
// inline style is exactly where a literal slips in, so this reads the text of
// every shipped file instead.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

/** The one file allowed to hold raw colour, because it is where colour is defined. */
const ALLOWED = 'src/tokens.css'

const SCANNED_EXTENSIONS = new Set(['.css', '.vue', '.ts', '.js', '.mjs'])

// A hex needs a boundary on both sides so `href="#main"` and an id are not
// mistaken for one. The functional forms are matched by name, so `translate(...)`
// stays untouched.
const PATTERNS = [
  /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{1}|[0-9a-fA-F]{3}|[0-9a-fA-F]{5})?\b(?![0-9a-zA-Z])/g,
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)/g,
]

export function findLiteralColours(text) {
  const found = []
  for (const pattern of PATTERNS) {
    for (const match of text.matchAll(pattern)) found.push({ value: match[0], at: match.index ?? 0 })
  }
  return found.sort((a, b) => a.at - b.at).map((entry) => entry.value)
}

function* walk(dir, root) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      yield* walk(full, root)
      continue
    }
    if (SCANNED_EXTENSIONS.has(extname(entry))) yield full
  }
}

/**
 * Scans the package's shipped source for colour literals.
 *
 * @returns {{file: string, line: number, matches: string[]}[]}
 */
export function scan(root) {
  const offences = []

  for (const file of walk(join(root, 'src'), root)) {
    const relativePath = relative(root, file).split('\\').join('/')
    if (relativePath === ALLOWED) continue

    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, index) => {
      const matches = findLiteralColours(line)
      if (matches.length > 0) offences.push({ file: relativePath, line: index + 1, matches })
    })
  }

  return offences
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const offences = scan(process.cwd())

  if (offences.length === 0) {
    console.log(`no colour literals outside ${ALLOWED}`)
    process.exit(0)
  }

  console.error(`Colour literals belong in ${ALLOWED} and nowhere else:\n`)
  for (const offence of offences) {
    console.error(`  ${offence.file}:${offence.line}  ${offence.matches.join(', ')}`)
  }
  process.exit(1)
}
