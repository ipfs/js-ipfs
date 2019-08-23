'use strict'

const path = require('path')
const glob = require('glob')
const pull = require('pull-stream')
const file = require('pull-file')
const CID = require('cids')

// Add the default assets to the repo.
module.exports = async function addDefaultAssets (self, log) {
  const initDocsPath = path.join(__dirname, '../../init-files/init-docs')
  const index = initDocsPath.lastIndexOf(path.sep)

  console.info('adding', initDocsPath)
  try {
    const results = await self.addFromFs(initDocsPath, {
      recursive: true
    })

    console.info(results)
  } catch (err) {
    console.error(err)
  }




  /*

  pull.through(file => {
      if (file.path === 'init-docs') {
        const cid = new CID(file.hash)
        log('to get started, enter:\n')
        log(`\tjsipfs cat /ipfs/${cid.toBaseEncodedString()}/readme\n`)
      }
    }),
    pull.collect((err) => {
      if (err) {
        return callback(err)
      }

      callback(null, true)
    })
  )
  */
}
