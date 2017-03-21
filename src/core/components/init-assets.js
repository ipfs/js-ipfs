'use strict'

const path = require('path')
const fs = require('fs')
const glob = require('glob')
const importer = require('ipfs-unixfs-engine').importer
const pull = require('pull-stream')
const file = require('pull-file')
// const mh = require('multihashes')

// Add the default assets to the repo.
module.exports = function addDefaultAssets (self, log, callback) {
  const initDocsPath = path.join(__dirname, '../../init-files/init-docs')
  const index = __dirname.lastIndexOf('/')

  pull(
    pull.values([initDocsPath]),
    pull.asyncMap((val, cb) => {
      glob(path.join(val, '/**/*'), cb)
    }),
    pull.flatten(),
    pull.map((element) => {
      const addPath = element.substring(index + 1, element.length)
      if (fs.statSync(element).isDirectory()) {
        return
      }

      return {
        path: addPath,
        content: file(element)
      }
    }),
    // Filter out directories, which are undefined from above
    pull.filter(Boolean),
    importer(self._ipldResolver),
    pull.through((el) => {
      if (el.path === 'files/init-docs/docs') {
        log('to get started, enter:')
        log()
        log(`\t jsipfs files cat /ipfs/QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB`)
        // TODO when we support pathing in unixfs-engine
        // const hash = mh.toB58String(el.multihash)
        // log(`\t jsipfs files cat /ipfs/${hash}/readme`)
        log()
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
