'use strict'

const path = require('path')
const globSource = require('ipfs-utils/src/files/glob-source')
const all = require('it-all')

/**
 * Add the default assets to the repo.
 *
 * @param {object} arg
 * @param {import('ipfs-core-types/src/root').API["addAll"]} arg.addAll
 * @param {(msg: string) => void} arg.print
 */
module.exports = async function initAssets ({ addAll, print }) {
  const initDocsPath = path.join(__dirname, '..', 'init-files', 'init-docs')
  const results = await all(addAll(globSource(initDocsPath, { recursive: true }), { preload: false }))

  const dir = results.filter(file => file.path === 'init-docs').pop()

  if (!dir) {
    return
  }

  print('to get started, enter:\n')
  print(`\tjsipfs cat /ipfs/${dir.cid}/readme\n`)
}
