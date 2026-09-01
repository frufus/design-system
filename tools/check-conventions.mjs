// Runs every convention check the package enforces, and reports each by name.
//
//   node tools/check-conventions.mjs
//
// One runner rather than four chained scripts: at four, the lint script had
// stopped being readable, and a person looking for "which rules does this
// project actually enforce" had to read a shell command to find out. The answer
// is now this file's CHECKS list, which docs/DESIGN-LANGUAGE.md is tested
// against - so a rule cannot be documented without a check, or checked without
// being documented.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { scan as scanLiteralColours } from './check-literal-colours.mjs'
import { scanForAppearanceProps } from './check-appearance-props.mjs'
import { scanForComposedClasses } from './check-composed-classes.mjs'

const SCANNED_DIRECTORIES = ['src', 'stories']
const SCANNED_EXTENSIONS = new Set(['.vue'])

function* walkComponents(dir) {
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
      yield* walkComponents(full)
      continue
    }
    if (SCANNED_EXTENSIONS.has(extname(entry))) yield full
  }
}

/** `<style scoped>` and any other style block inside a component. */
export function findStyleBlocks(text) {
  return [...text.matchAll(/<style\b[^>]*>/g)].map((match) => match[0])
}

/** @returns {{file: string, line: number, matches: string[]}[]} */
export function scanForStyleBlocks(root) {
  const offences = []

  for (const directory of SCANNED_DIRECTORIES) {
    for (const file of walkComponents(join(root, directory))) {
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, index) => {
        const matches = findStyleBlocks(line)
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

/**
 * `<template>` belongs before `<script setup>`.
 *
 * The markup is what a reader opens a component for; the setup block is how it
 * got there. This compares the position of the two opening tags rather than
 * parsing the file - the question is about ordering, and a parser would be a
 * large dependency for a comparison of two numbers. A file with no template is
 * ignored, because the rule has nothing to say about it.
 */
export function findScriptBeforeTemplate(text) {
  const template = text.indexOf('<template')
  const script = text.indexOf('<script')

  if (template === -1 || script === -1) return []
  return script < template ? ['<script> comes before <template>'] : []
}

/** @returns {{file: string, line: number, matches: string[]}[]} */
export function scanForScriptBeforeTemplate(root) {
  const offences = []

  for (const directory of SCANNED_DIRECTORIES) {
    for (const file of walkComponents(join(root, directory))) {
      const text = readFileSync(file, 'utf8')
      const matches = findScriptBeforeTemplate(text)
      if (matches.length > 0) {
        offences.push({
          file: relative(root, file).split('\\').join('/'),
          line: text.slice(0, text.indexOf('<script')).split('\n').length,
          matches,
        })
      }
    }
  }

  return offences
}

/**
 * Every rule this package enforces mechanically. `id` is what
 * docs/DESIGN-LANGUAGE.md refers to, and a test asserts the two agree in both
 * directions.
 */
export const CHECKS = [
  {
    id: 'no-colour-literals',
    title: 'Colour comes only from tokens',
    scan: scanLiteralColours,
    explain: 'Colour literals belong in src/tokens.css and nowhere else.',
  },
  {
    id: 'no-appearance-props',
    title: 'Appearance is set on the document, never handed to a component',
    scan: scanForAppearanceProps,
    explain: 'A component that can be told its appearance can branch on it.',
  },
  {
    id: 'no-composed-classes',
    title: 'Class names are literal',
    scan: scanForComposedClasses,
    explain: 'Tailwind only emits class names it has seen literally.',
  },
  {
    id: 'template-before-script',
    title: 'Components put their markup first',
    scan: scanForScriptBeforeTemplate,
    explain:
      'The markup is what a reader opens a component for; the setup block is ' +
      'how it got there.',
  },
  {
    id: 'no-style-blocks',
    title: 'Components carry no stylesheet of their own',
    scan: scanForStyleBlocks,
    explain:
      'A style block is where a component starts holding values that are not ' +
      'tokens, and scoping hides that it has.',
  },
]

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.cwd()
  let failed = false

  for (const check of CHECKS) {
    const offences = check.scan(root)

    if (offences.length === 0) {
      console.log(`ok    ${check.id}`)
      continue
    }

    failed = true
    console.error(`FAIL  ${check.id} - ${check.title}`)
    console.error(`      ${check.explain}`)
    for (const offence of offences) {
      console.error(`      ${offence.file}:${offence.line}  ${offence.matches.join(', ')}`)
    }
  }

  process.exit(failed ? 1 : 0)
}
