'use strict'

const path = require('path')
const glob = require('glob')
const pull = require('pull-stream')
const file = require('pull-file')
const CID = require('cids')

// Add the default assets to the repo.
module.exports = function addDefaultAssets (self, log, callback) {
  const initDocsPath = path.join(__dirname, '../../init-files/init-docs')
  const index = initDocsPath.lastIndexOf(path.sep)

  pull(
    pull.values([initDocsPath]),
    pull.asyncMap((val, cb) =>
      glob(path.join(val, '/**/*'), { nodir: true }, cb)
    ),
    pull.flatten(),
    pull.map(element => {
      const addPath = element.substring(index + 1)
      return { path: addPath, content: file(element) }
    }),
    self.files.addPullStream(),
    pull.through(file => {
      if (file.path === 'init-docs') {
        const cid = new CID(file.hash)
        log('to get started, enter:\n')
        log(`\tjsipfs files cat /ipfs/${cid.toBaseEncodedString()}/readme\n`)
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
