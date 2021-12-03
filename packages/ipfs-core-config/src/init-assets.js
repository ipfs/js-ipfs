import all from 'it-all'
import assets from './init-files/init-docs/index.js'

/**
 * Add the default assets to the repo.
 *
 * @param {object} arg
 * @param {import('ipfs-core-types/src/root').API<{}>["addAll"]} arg.addAll
 * @param {(msg: string) => void} arg.print
 */
export async function initAssets ({ addAll, print }) {
  const results = await all(addAll(assets, { preload: false }))
  const dir = results.filter(file => file.path === 'init-docs').pop()

  if (!dir) {
    return
  }

  print('to get started, enter:\n')
  print(`\tjsipfs cat /ipfs/${dir.cid}/readme\n`)
}
