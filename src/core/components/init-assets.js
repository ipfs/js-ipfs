'use strict'

const path = require('path')
const fs = require('fs')
const glob = require('glob')
const importer = require('ipfs-unixfs-engine').importer
const pull = require('pull-stream')
const file = require('pull-file')
const CID = require('cids')

// Add the default assets to the repo.
module.exports = function addDefaultAssets (self, log, callback) {
  const initDocsPath = path.join(__dirname, '../../init-files/init-docs')
  const index = initDocsPath.lastIndexOf('/')

  pull(
    pull.values([initDocsPath]),
    pull.asyncMap((val, cb) => glob(path.join(val, '/**/*'), cb)),
    pull.flatten(),
    pull.map((element) => {
      const addPath = element.substring(index + 1)

      if (fs.statSync(element).isDirectory()) { return }

      return { path: addPath, content: file(element) }
    }),
    // Filter out directories, which are undefined from above
    pull.filter(Boolean),
    importer(self._ipldResolver),
    pull.through((el) => {
      if (el.path === 'init-docs') {
        const cid = new CID(el.multihash)
        log('to get started, enter:\n')
        log(`\t jsipfs files cat /ipfs/${cid.toBaseEncodedString()}/readme\n`)
      }
    }),
    pull.collect((err) => {
      if (err) {
        return callback(err)
      }

      callback(null, true)
    })
  )
}
