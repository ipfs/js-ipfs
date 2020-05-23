'use strict'

const path = require('path')
const globSource = require('ipfs-utils/src/files/glob-source')
const all = require('it-all')

/**
 * Add the default assets to the repo.
 * @param {*} config
 */
module.exports = async function initAssets ({ add, print }) {
  const initDocsPath = path.join(__dirname, '..', '..', 'init-files', 'init-docs')
  /** @type {{path:string, cid:string}[]} */
  const results = await all(add(globSource(initDocsPath, { recursive: true }), { preload: false }))
  const dir = results.filter(file => file.path === 'init-docs').pop()

  print('to get started, enter:\n')
  // @ts-ignore - it could be undefined so TS complains
  print(`\tjsipfs cat /ipfs/${dir.cid}/readme\n`)
}
