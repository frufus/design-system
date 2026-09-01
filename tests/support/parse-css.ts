// A deliberately small CSS reader for the checks that guard the token
// foundation. It understands the subset this package writes - at-rules, plain
// rules and custom properties - and refuses anything it does not recognise
// rather than skipping it, because a stylesheet that fails to parse is exactly
// the one a regex would wave through.

export class CssParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CssParseError'
  }
}

export interface CssBlock {
  /** The rule's selector, whitespace normalised. */
  selector: string
  /** Enclosing at-rule preludes, outermost first. */
  atRules: string[]
  /** Declared property to value, last declaration winning. */
  declarations: Record<string, string>
}

const normalise = (text: string) => text.replace(/\s+/g, ' ').trim()

function stripComments(source: string, label: string): string {
  let out = ''
  let i = 0
  while (i < source.length) {
    if (source.startsWith('/*', i)) {
      const end = source.indexOf('*/', i + 2)
      if (end === -1) throw new CssParseError(`${label}: comment is never closed`)
      // Keep a space so `a/*x*/b` cannot become a single token.
      out += ' '
      i = end + 2
      continue
    }
    out += source[i]
    i += 1
  }
  return out
}

function parseDeclarations(body: string, label: string): Record<string, string> {
  const declarations: Record<string, string> = {}

  for (const raw of splitTopLevel(body, ';')) {
    const statement = raw.trim()
    if (statement === '') continue

    const colon = indexOfTopLevel(statement, ':')
    if (colon === -1) {
      throw new CssParseError(`${label}: declaration without a value: "${normalise(statement)}"`)
    }

    const property = statement.slice(0, colon).trim()
    const value = normalise(statement.slice(colon + 1))
    if (property === '') {
      throw new CssParseError(`${label}: declaration without a property: "${normalise(statement)}"`)
    }
    declarations[property] = value
  }

  return declarations
}

/** Splits on a separator that is not inside parentheses. */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''

  for (const ch of text) {
    if (ch === '(') depth += 1
    else if (ch === ')') depth = Math.max(0, depth - 1)

    if (ch === separator && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += ch
  }
  parts.push(current)
  return parts
}

function indexOfTopLevel(text: string, character: string): number {
  let depth = 0
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (ch === '(') depth += 1
    else if (ch === ')') depth = Math.max(0, depth - 1)
    else if (ch === character && depth === 0) return i
  }
  return -1
}

/** Reads a rule body from just after its `{` to its matching `}`. */
function readBody(text: string, start: number, label: string): { body: string; next: number } {
  let depth = 1
  let i = start

  while (i < text.length) {
    const ch = text[i]
    if (ch === '{') depth += 1
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return { body: text.slice(start, i), next: i + 1 }
    }
    i += 1
  }

  throw new CssParseError(`${label}: a block opened and was never closed`)
}

export function parseCss(source: string, label = '<inline>'): CssBlock[] {
  const text = stripComments(source, label)
  const blocks: CssBlock[] = []
  const atRules: string[] = []
  let prelude = ''
  let i = 0

  while (i < text.length) {
    const ch = text[i]

    if (ch === '{') {
      const head = normalise(prelude)
      prelude = ''
      i += 1

      if (head.startsWith('@')) {
        atRules.push(head)
        continue
      }

      const { body, next } = readBody(text, i, label)
      blocks.push({
        selector: head,
        atRules: [...atRules],
        declarations: parseDeclarations(body, label),
      })
      i = next
      continue
    }

    if (ch === '}') {
      if (atRules.length === 0) {
        throw new CssParseError(`${label}: closing brace with no block to close`)
      }
      atRules.pop()
      prelude = ''
      i += 1
      continue
    }

    prelude += ch
    i += 1
  }

  if (atRules.length > 0) {
    throw new CssParseError(`${label}: ${atRules.length} at-rule block(s) never closed`)
  }
  if (normalise(prelude) !== '') {
    throw new CssParseError(`${label}: trailing text outside any block: "${normalise(prelude)}"`)
  }

  return blocks
}
