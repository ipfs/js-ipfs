'use strict'

const mh = require('multihashes')
const promisify = require('promisify-es6')
const eachOfSeries = require('async/eachOfSeries')
const debug = require('debug')
const log = debug('jsipfs:http-gateway:resolver')
log.error = debug('jsipfs:http-gateway:resolver:error')

const html = require('./utils/html')
const PathUtil = require('./utils/path')

const INDEX_HTML_FILES = [ 'index.html', 'index.htm', 'index.shtml' ]

const resolveDirectory = promisify((ipfs, path, multihash, callback) => {
  if (!callback) {
    callback = noop
  }

  mh.validate(mh.fromB58String(multihash))

  ipfs
   .object
   .get(multihash, { enc: 'base58' })
   .then((DAGNode) => {
     const links = DAGNode.links
     const indexFiles = links.filter((link) => INDEX_HTML_FILES.indexOf(link.name) !== -1)

     // found index file in links
     if (indexFiles.length > 0) {
       return callback(null, indexFiles)
     }

     return callback(null, html.build(path, links))
   })
})

const noop = function () {}

const resolveMultihash = promisify((ipfs, path, callback) => {
  if (!callback) {
    callback = noop
  }

  const parts = PathUtil.splitPath(path)
  const partsLength = parts.length

  let currentMultihash = parts[0]

  eachOfSeries(parts, (multihash, currentIndex, next) => {
    // throws error when invalid multihash is passed
    mh.validate(mh.fromB58String(currentMultihash))
    log('currentMultihash: ', currentMultihash)
    log('currentIndex: ', currentIndex, '/', partsLength)

    ipfs
     .object
     .get(currentMultihash, { enc: 'base58' })
     .then((DAGNode) => {
      //  log('DAGNode: ', DAGNode)
       if (currentIndex === partsLength - 1) {
          // leaf node
         log('leaf node: ', currentMultihash)
        //  log('DAGNode: ', DAGNode.links)

         if (DAGNode.links &&
             DAGNode.links.length > 0 &&
             DAGNode.links[0].name.length > 0) {
           //  this is a directory.
           let isDirErr = new Error('This dag node is a directory')
           // add currentMultihash as a fileName so it can be used by resolveDirectory
           isDirErr.fileName = currentMultihash
           return next(isDirErr)
         }

         next()
       } else {
          // find multihash of requested named-file
          // in current DAGNode's links
         let multihashOfNextFile
         const nextFileName = parts[currentIndex + 1]
         const links = DAGNode.links

         for (let link of links) {
           if (link.name === nextFileName) {
              // found multihash of requested named-file
             multihashOfNextFile = mh.toB58String(link.multihash)
             log('found multihash: ', multihashOfNextFile)
             break
           }
         }

         if (!multihashOfNextFile) {
           log.error(`no link named "${nextFileName}" under ${currentMultihash}`)
           throw new Error(`no link named "${nextFileName}" under ${currentMultihash}`)
         }

         currentMultihash = multihashOfNextFile
         next()
       }
     })
  }, (err) => {
    if (err) {
      log.error(err)
      return callback(err)
    }
    callback(null, {multihash: currentMultihash})
  })
})

module.exports = {
  resolveDirectory,
  resolveMultihash
}
