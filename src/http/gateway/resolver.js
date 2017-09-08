'use strict'

const mh = require('multihashes')
const promisify = require('promisify-es6')
const reduce = require('async/reduce')
const CID = require('cids')
const Unixfs = require('ipfs-unixfs')
const debug = require('debug')
const log = debug('jsipfs:http-gateway:resolver')
log.error = debug('jsipfs:http-gateway:resolver:error')

const dirView = require('./dir-view')
const pathUtil = require('./utils/path')

function getIndexFiles (links) {
  const INDEX_HTML_FILES = [
    'index.html',
    'index.htm',
    'index.shtml'
  ]

  return links.filter((link) => INDEX_HTML_FILES.indexOf(link.name) !== -1)
}

const resolveDirectory = promisify((ipfs, path, multihash, callback) => {
  mh.validate(mh.fromB58String(multihash))

  ipfs.object.get(multihash, { enc: 'base58' }, (err, dagNode) => {
    if (err) { return callback(err) }

    const indexFiles = getIndexFiles(dagNode.links)

    if (indexFiles.length > 0) {
      return callback(null, indexFiles)
    }

    return callback(null, dirView.render(path, dagNode.links))
  })
})

const resolveMultihash = promisify((ipfs, path, callback) => {
  const parts = pathUtil.splitPath(path)
  let firstMultihash = parts.shift()
  let currentCid

  reduce(parts, firstMultihash, (memo, item, next) => {
    try {
      currentCid = new CID(mh.fromB58String(memo))
    } catch (err) {
      return next(err)
    }

    log('memo: ', memo)
    log('item: ', item)

    ipfs.dag.get(currentCid, (err, result) => {
      if (err) { return next(err) }

      let dagNode = result.value
      // find multihash of requested named-file in current dagNode's links
      let multihashOfNextFile
      let nextFileName = item

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
        return next(new Error(`no link named "${nextFileName}" under ${memo}`))
      }

      next(null, multihashOfNextFile)
    })
  }, (err, result) => {
    if (err) { return callback(err) }

    let cid
    try {
      cid = new CID(mh.fromB58String(result))
    } catch (err) {
      return callback(err)
    }

    ipfs.dag.get(cid, (err, dagResult) => {
      if (err) return callback(err)

      let dagDataObj = Unixfs.unmarshal(dagResult.value.data)
      if (dagDataObj.type === 'directory') {
        let isDirErr = new Error('This dag node is a directory')
        // add memo (last multihash) as a fileName so it can be used by resolveDirectory
        isDirErr.fileName = result
        return callback(isDirErr)
      }

      callback(null, { multihash: result })
    })
  })
})

module.exports = {
  resolveDirectory: resolveDirectory,
  resolveMultihash: resolveMultihash
}
