'use strict'

const path = require('path')
const CID = require('cids')

// Add the default assets to the repo.
module.exports = async function addDefaultAssets (self, log) {
  const initDocsPath = path.join(__dirname, '../../init-files/init-docs')

  const results = await self.addFromFs(initDocsPath, {
    recursive: true
  })

  const dir = results.filter(file => file.path === 'init-docs').pop()
  const cid = new CID(dir.hash)

  log('to get started, enter:\n')
  log(`\tjsipfs cat /ipfs/${cid.toBaseEncodedString()}/readme\n`)
}
