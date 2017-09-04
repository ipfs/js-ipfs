'use strict'

const mh = require('multihashes')
const promisify = require('promisify-es6')
const eachOfSeries = require('async/eachOfSeries')
const CID = require('cids')
const Unixfs = require('ipfs-unixfs')
const debug = require('debug')
const log = debug('jsipfs:http-gateway:resolver')
log.error = debug('jsipfs:http-gateway:resolver:error')
const html = require('./utils/html')
const PathUtil = require('./utils/path')

const INDEX_HTML_FILES = [ 'index.html', 'index.htm', 'index.shtml' ]

function noop () {}

const resolveDirectory = promisify((ipfs, path, multihash, callback) => {
  callback = callback || noop

  mh.validate(mh.fromB58String(multihash))

  ipfs.object.get(multihash, { enc: 'base58' }, (err, dagNode) => {
    if (err) { return callback(err) }

    const links = dagNode.links
    const indexFiles = links.filter((link) => INDEX_HTML_FILES.indexOf(link.name) !== -1)

    // found index file in links
    if (indexFiles.length > 0) {
      return callback(null, indexFiles)
    }

    return callback(null, html.build(path, links))
  })
})

const resolveMultihash = promisify((ipfs, path, callback) => {
  callback = callback || noop

  const parts = PathUtil.splitPath(path)
  const partsLength = parts.length

  let currentMultihash = parts[0]
  let currentCid
  eachOfSeries(parts, (multihash, currentIndex, next) => {
    // throws error when invalid CID is passed
    try {
      currentCid = new CID(mh.fromB58String(currentMultihash))
    } catch (e) {
      if (e) throw e
    }

    log('currentMultihash: ', currentMultihash)
    log('currentIndex: ', currentIndex, '/', partsLength)

    ipfs.dag.get(currentCid, (err, result) => {
      if (err) { return next(err) }
      let dagNode = result.value

      if (currentIndex === partsLength - 1) {
        let dagDataObj = Unixfs.unmarshal(dagNode.data)
        if (dagDataObj.type === 'directory') {
          let isDirErr = new Error('This dag node is a directory')
          // add currentMultihash as a fileName so it can be used by resolveDirectory
          isDirErr.fileName = currentMultihash
          return next(isDirErr)
        }

        return next()
      }

      // find multihash of requested named-file in current dagNode's links
      let multihashOfNextFile
      const nextFileName = parts[currentIndex + 1]
      const links = dagNode.links

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
        return next(new Error(`no link named "${nextFileName}" under ${currentMultihash}`))
      }

      currentMultihash = multihashOfNextFile
      next()
    })
  }, (err) => {
    if (err) { return callback(err) }
    callback(null, { multihash: currentMultihash })
  })
})

module.exports = {
  resolveDirectory: resolveDirectory,
  resolveMultihash: resolveMultihash
}
