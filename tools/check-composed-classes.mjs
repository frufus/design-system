// Fails when a class name is assembled from a variable.
//
//   node tools/check-composed-classes.mjs
//
// Two failures at once, which is why this is a build rule rather than a review
// habit: the class cannot be found by searching for it, and Tailwind - which
// only emits class names it has seen literally - never generates it. The element
// renders unstyled and nothing says why.
//
// Runs as part of `npm run lint`. When the design-language checks land, this and
// its two siblings are worth consolidating into one conventions runner; three
// scripts is the point where that stops being premature.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const SCANNED_DIRECTORIES = ['src', 'stories']
const SCANNED_EXTENSIONS = new Set(['.vue', '.ts'])

// Prefixes of the utilities this package claims. A composed string only matters
// if what it is composing looks like a class name; `${count} items` does not.
const UTILITY = String.raw`(?:bg|text|border|ring|fill|stroke|rounded|h|w|px|py|p|m|gap|font|leading|tracking|shadow|hover:|focus:|active:|disabled:)`

const PATTERNS = [
  // A template literal whose text carries a utility prefix and an interpolation.
  new RegExp(String.raw`\`[^\`]*\b${UTILITY}-[^\`]*\$\{[^\`]*\``),
  // The same thing built by concatenation: 'text-' + tone
  //
  // Only the opening half is matched. A pattern for the trailing half - a plus
  // followed by a short quoted token - would flag every ordinary concatenation
  // in the package, and a check that cries wolf gets switched off.
  new RegExp(String.raw`'[^']*\b${UTILITY}-'\s*\+`),
]

export function findComposedClasses(text) {
  const matches = []
  for (const pattern of PATTERNS) {
    const found = pattern.exec(text)
    if (found) matches.push(found[0].trim())
  }
  return matches
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
export function scanForComposedClasses(root) {
  const offences = []

  for (const directory of SCANNED_DIRECTORIES) {
    for (const file of walk(join(root, directory))) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, index) => {
        const matches = findComposedClasses(line)
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
  const offences = scanForComposedClasses(process.cwd())

  if (offences.length === 0) {
    console.log('no class name is assembled from a variable')
    process.exit(0)
  }

  console.error(
    'Tailwind only emits class names it has seen literally.\n' +
      'These are assembled at runtime, so they are never generated:\n',
  )
  for (const offence of offences) {
    console.error(`  ${offence.file}:${offence.line}  ${offence.matches.join(', ')}`)
  }
  process.exit(1)
}
