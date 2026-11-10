#!/usr/bin/env node
/**
 * Validate a format-1 DSH plugin market index with the official validator
 * (@deepseek-ai/dsh-plugin-market-index), the same rules DSH applies when it
 * reads a source. Accepts a local path or an http(s) URL.
 *
 *   node script/validate-index.mjs index.json https://example.com/index.json
 *   node script/validate-index.mjs https://example.com/index.json
 */
import { readFile } from 'node:fs/promises'
import {
  MarketIndexError,
  marketInstallTarget,
  parseMarketIndex,
} from '@deepseek-ai/dsh-plugin-market-index'

const FALLBACK_INDEX_URL =
  'https://raw.githubusercontent.com/laughmaker/dsh-plugin-market/main/index.json'

const args = process.argv.slice(2)

function usage(message) {
  if (message) console.error(`error: ${message}`)
  console.error('usage: node script/validate-index.mjs <path-or-url> [index-url]')
  process.exit(2)
}

const source = args[0]
if (!source) usage()

const isRemote = /^https?:\/\//u.test(source)
const indexUrl = args[1] ?? (isRemote ? source : FALLBACK_INDEX_URL)
if (!URL.canParse(indexUrl)) usage(`index URL ${JSON.stringify(indexUrl)} is not an absolute URL`)

let text
if (isRemote) {
  const response = await fetch(source, { headers: { accept: 'application/json' } })
  if (!response.ok) {
    console.error(`error: ${source} responded ${String(response.status)} ${response.statusText}`)
    process.exit(1)
  }
  text = await response.text()
} else {
  text = await readFile(source, 'utf8')
}

let value
try {
  value = JSON.parse(text)
} catch (error) {
  console.error(`error: not valid JSON — ${error.message}`)
  process.exit(1)
}

let index
try {
  index = parseMarketIndex(value, indexUrl)
} catch (error) {
  if (!(error instanceof MarketIndexError)) throw error
  console.error(`INVALID ${error.path} ${error.reason}`)
  process.exit(1)
}

const language = index.title.en
console.log(`index ok: "${language}" (${index.title.zh ?? 'no zh title'})`)
console.log(`  validated against ${indexUrl}`)
console.log(`  categories: ${Object.keys(index.metadata.categories).join(', ') || '(none)'}`)
console.log(`  labels: ${Object.keys(index.metadata.labels).join(', ') || '(none)'}`)
console.log(`  plugins: ${String(index.plugins.length)}`)
for (const plugin of index.plugins) {
  console.log(`  - ${plugin.name} (${plugin.title?.en ?? plugin.name})`)
  for (const version of plugin.versions) {
    const target = marketInstallTarget(plugin.name, version)
    const engines = version.engines.dsh ?? '(unbounded)'
    const registry = target.registry ? ` first-registry=${target.registry}` : ''
    console.log(`      ${version.version}  dsh ${engines}  ${target.spec}${registry}`)
  }
}
