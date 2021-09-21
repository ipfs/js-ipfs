
import path, { dirname } from 'path'
import globSource from 'ipfs-utils/src/files/glob-source.js'
import all from 'it-all'
import { fileURLToPath } from 'url'

// @ts-ignore need to set module to es2020 to use import.meta.url, which we do,
// but then the "--module" setting doesn't get used by the "--build" setting
// which we use to build types from jsdoc
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Add the default assets to the repo.
 *
 * @param {object} arg
 * @param {import('ipfs-core-types/src/root').API["addAll"]} arg.addAll
 * @param {(msg: string) => void} arg.print
 */
export async function initAssets ({ addAll, print }) {
  const initDocsPath = path.join(__dirname, 'init-files', 'init-docs')
  const results = await all(addAll(globSource(initDocsPath, { recursive: true }), { preload: false }))

  const dir = results.filter(file => file.path === 'init-docs').pop()

  if (!dir) {
    return
  }

  print('to get started, enter:\n')
  print(`\tjsipfs cat /ipfs/${dir.cid}/readme\n`)
}
