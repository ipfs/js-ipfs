'use strict'

const mh = require('multihashes')
// const pf = require('promised-for')
const promisify = require('promisify-es6')
const eachOf = require('async/eachOf')

const html = require('./utils/html')
const PathUtil = require('./utils/path')

const INDEX_HTML_FILES = [ 'index.html', 'index.htm', 'index.shtml' ]

const resolveDirectory = promisify((ipfs, path, callback) => {
  if (!callback) {
    callback = noop
  }

  const parts = PathUtil.splitPath(path)
  const multihash = parts[0]

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

  eachOf(parts, (multihash, currentIndex, next) => {
    // throws error when invalid multihash is passed
    mh.validate(mh.fromB58String(currentMultihash))

    ipfs
     .object
     .get(currentMultihash, { enc: 'base58' })
     .then((DAGNode) => {
       //  console.log('DAGNode: ', DAGNode)
       if (DAGNode.links && DAGNode.links.length > 0 && DAGNode.links[0].name.length > 0) {
         //  this is a directory.
         // fire directory error here.
         return next(new Error('This dag node is a directory'))
       }

       if (currentIndex === partsLength - 1) {
          // leaf node
         console.log('leaf node: ', currentMultihash)
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
             console.log('found multihash: ', multihashOfNextFile)
             break
           }
         }

         if (!multihashOfNextFile) {
           throw new Error(`no link named "${nextFileName}" under ${currentMultihash}`)
         }

         currentMultihash = multihashOfNextFile
         next()
       }
     })
  }, (err) => {
    if (err) {
      return callback(err)
    }
    callback(null, {multihash: currentMultihash})
  })
  // Original implementation
  // return pf(
  //   {
  //     multihash: parts[0],
  //     index: 0
  //   },
  //   (i) => i.index < partsLength,
  //   (i) => {
  //     const currentIndex = i.index
  //     const currentMultihash = i.multihash
  //
  //     // throws error when invalid multihash is passed
  //     mh.validate(mh.fromB58String(currentMultihash))
  //
  //     return ipfs
  //            .object
  //            .get(currentMultihash, { enc: 'base58' })
  //            .then((DAGNode) => {
  //              if (currentIndex === partsLength - 1) {
  //                 // leaf node
  //                return {
  //                  multihash: currentMultihash,
  //                  index: currentIndex + 1
  //                }
  //              } else {
  //                 // find multihash of requested named-file
  //                 // in current DAGNode's links
  //                let multihashOfNextFile
  //                const nextFileName = parts[currentIndex + 1]
  //                const links = DAGNode.links
  //
  //                for (let link of links) {
  //                  if (link.name === nextFileName) {
  //                     // found multihash of requested named-file
  //                    multihashOfNextFile = mh.toB58String(link.multihash)
  //                    break
  //                  }
  //                }
  //
  //                if (!multihashOfNextFile) {
  //                  throw new Error(`no link named "${nextFileName}" under ${currentMultihash}`)
  //                }
  //
  //                return {
  //                  multihash: multihashOfNextFile,
  //                  index: currentIndex + 1
  //                }
  //              }
  //            })
  //   })
})

module.exports = {
  resolveDirectory,
  resolveMultihash
}
