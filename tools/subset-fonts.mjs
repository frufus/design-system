// Vendors the typefaces into src/fonts/ as subset variable woff2, so a consuming
// project serves them from its own origin and the interface renders correctly
// with no network at all.
//
//   node tools/subset-fonts.mjs
//
// This is an authoring step, not a build step. A consumer never runs it and CI
// does not need Python; the outputs are committed. It needs network access and
// `fonttools` with `brotli` on the PATH:
//
//   pip install fonttools brotli
//
// Re-running it must leave no diff. If it does, either a source version moved or
// the ranges below changed - both are decisions, and both belong in a commit
// message rather than in a silent byte difference.

import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const CDN = 'https://cdn.jsdelivr.net/npm'
const VERSION = '5.3.0'

// Basic Latin, the Latin-1 supplement, and the punctuation and symbols this
// package actually draws. Deliberately no Greek, Cyrillic or Vietnamese: a
// project that needs them adds the subset itself rather than every project
// paying for them.
const UNICODES = [
  'U+0020-007E', // basic latin
  'U+00A0-00FF', // latin-1 supplement
  'U+2010-2015', // dashes
  'U+2018-201D', // curly quotes
  'U+2022', // bullet
  'U+2026', // ellipsis
  'U+00B7', // middle dot
  'U+0394', // delta, for colour-distance labels
  'U+2192', // right arrow
  'U+2194', // left-right arrow
  'U+2260', // not equal
  'U+2264', // less or equal
  'U+2265', // greater or equal
].join(',')

export const FAMILIES = [
  {
    token: 'sans',
    family: 'Atkinson Hyperlegible Next',
    pkg: '@fontsource-variable/atkinson-hyperlegible-next',
    file: 'atkinson-hyperlegible-next-latin-wght-normal.woff2',
    out: 'atkinson-hyperlegible-next-latin.woff2',
    expectedBytes: 30324,
  },
  {
    token: 'mono',
    family: 'Atkinson Hyperlegible Mono',
    pkg: '@fontsource-variable/atkinson-hyperlegible-mono',
    file: 'atkinson-hyperlegible-mono-latin-wght-normal.woff2',
    out: 'atkinson-hyperlegible-mono-latin.woff2',
    expectedBytes: 15352,
  },
]

/** Sizes drift by a byte or two between fonttools releases; a jump is a signal. */
const TOLERANCE = 0.1

async function download(url, target) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} responded ${response.status}`)
  writeFileSync(target, Buffer.from(await response.arrayBuffer()))
}

function subset(input, output) {
  execFileSync(
    'python',
    [
      '-m',
      'fontTools.subset',
      input,
      `--output-file=${output}`,
      '--flavor=woff2',
      `--unicodes=${UNICODES}`,
      '--no-hinting',
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
  )
}

async function main() {
  // fontTools takes filesystem paths, not URLs.
  const outDir = fileURLToPath(new URL('../src/fonts/', import.meta.url))
  mkdirSync(outDir, { recursive: true })
  const work = mkdtempSync(join(tmpdir(), 'fds-fonts-'))

  try {
    for (const font of FAMILIES) {
      const source = join(work, font.file)
      await download(`${CDN}/${font.pkg}@${VERSION}/files/${font.file}`, source)

      const target = join(outDir, font.out)
      subset(source, target)

      const bytes = statSync(target).size
      const drift = Math.abs(bytes - font.expectedBytes) / font.expectedBytes
      const note = drift > TOLERANCE ? `  UNEXPECTED (recorded ${font.expectedBytes})` : ''
      console.log(`${font.out.padEnd(46)} ${String(bytes).padStart(7)} bytes${note}`)
      if (drift > TOLERANCE) {
        throw new Error(
          `${font.out} is ${bytes} bytes, ${Math.round(drift * 100)}% off the recorded ` +
            `${font.expectedBytes}. Check the source version and the ranges before committing.`,
        )
      }
    }

    // One licence covers both families; they carry the same terms and the same
    // project authors, so a single file beside the fonts is the honest record.
    const licence = await fetch(`${CDN}/${FAMILIES[0].pkg}@${VERSION}/LICENSE`)
    if (!licence.ok) throw new Error(`licence responded ${licence.status}`)
    const text = await licence.text()
    if (!text.includes('SIL OPEN FONT LICENSE')) {
      throw new Error('the fetched licence is not the SIL OFL - refusing to ship it')
    }
    writeFileSync(join(outDir, 'OFL.txt'), text, 'utf8')
    console.log(`${'OFL.txt'.padEnd(46)} ${String(Buffer.byteLength(text)).padStart(7)} bytes`)
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    execFileSync('python', ['-c', 'import fontTools, brotli'], { stdio: 'ignore' })
  } catch {
    console.error('needs fonttools and brotli on the PATH: pip install fonttools brotli')
    process.exit(1)
  }
  await main()
}

