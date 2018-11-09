'use strict'

const mh = require('multihashes')
const promisify = require('promisify-es6')
const reduce = require('async/reduce')
const CID = require('cids')
const Unixfs = require('ipfs-unixfs')
const debug = require('debug')
const log = debug('jsipfs:http:response:resolver')
log.error = debug('jsipfs:http:response:resolver:error')

const dirView = require('./dir-view')
const pathUtil = require('./utils/path')

function getIndexFiles (links) {
  const INDEX_HTML_FILES = [
    'index.html',
    'index.htm',
    'index.shtml'
  ]
  // directory
  let indexes = links.filter((link) => INDEX_HTML_FILES.indexOf(link.name) !== -1)
  if (indexes.length) {
    return indexes
  }
  // hamt-sharded-directory uses a 2 char prefix
  return links.filter((link) => {
    return link.name.length > 2 && INDEX_HTML_FILES.indexOf(link.name.substring(2)) !== -1
  })
}

const directory = promisify((ipfs, path, cid, callback) => {
  cid = new CID(cid)

  ipfs.object.get(cid.buffer, (err, dagNode) => {
    if (err) {
      return callback(err)
    }

    // Test if it is a Website
    const indexFiles = getIndexFiles(dagNode.links)

    if (indexFiles.length) {
      return callback(null, indexFiles)
    }

    return callback(null, dirView.render(path, dagNode.links))
  })
})

const cid = promisify((ipfs, path, callback) => {
  const parts = pathUtil.cidArray(path)
  let firstCid = parts.shift()
  let currentCid

  // TODO: replace below with ipfs.resolve(path, {recursive: true})
  // (requires changes to js-ipfs/js-ipfs-api)

  reduce(
    parts,
    firstCid,
    (memo, item, next) => {
      try {
        currentCid = new CID(memo)
      } catch (err) {
        return next(err)
      }

      log('memo: ', memo)
      log('item: ', item)

      ipfs.dag.get(currentCid, (err, result) => {
        if (err) {
          return next(err)
        }

        const dagNode = result.value
        // find multihash/cid of requested named-file in current dagNode's links
        let cidOfNextFile
        const nextFileName = item

        try {
          for (let link of dagNode.links) {
            if (link.name === nextFileName) {
              // found multihash/cid of requested named-file
              try {
                // assume a Buffer with a valid CID
                // (cid is allowed instead of multihash since https://github.com/ipld/js-ipld-dag-pb/pull/80)
                cidOfNextFile = new CID(link.cid)
              } catch (err) {
                // fallback to multihash
                cidOfNextFile = new CID(mh.toB58String(link.multihash))
              }
              break
            }
          }
        } catch (err) {
          return next(err)
        }

        if (!cidOfNextFile) {
          const missingLinkErr = new Error(`no link named "${nextFileName}" under ${memo}`)
          missingLinkErr.parentDagNode = memo
          missingLinkErr.missingLinkName = nextFileName
          return next(missingLinkErr)
        }

        next(null, cidOfNextFile)
      })
    }, (err, cid) => {
      if (err) {
        return callback(err)
      }

      try {
        cid = new CID(cid)
      } catch (err) {
        return callback(err)
      }

      if (cid.codec === 'raw') {
        // no need for additional lookup, its raw data
        callback(null, { cid })
      }

      ipfs.dag.get(cid, (err, dagResult) => {
        if (err) {
          return callback(err)
        }

        try {
          let dagDataObj = Unixfs.unmarshal(dagResult.value.data)
          // There are at least two types of directories:
          // - "directory"
          // - "hamt-sharded-directory" (example: QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX)
          if (dagDataObj.type === 'directory' || dagDataObj.type === 'hamt-sharded-directory') {
            let isDirErr = new Error('This dag node is a directory')
            // store memo of last multihash so it can be used by directory
            isDirErr.cid = isDirErr.fileName = cid
            isDirErr.dagDirType = dagDataObj.type
            return callback(isDirErr)
          }
        } catch (err) {
          return callback(err)
        }

        callback(null, { cid })
      })
    })
})

const multihash = promisify((ipfs, path, callback) => {
  // deprecated, use 'cid' instead
  // (left for backward-compatibility)
  cid(ipfs, path)
    .then((result) => { callback(null, { multihash: mh.toB58String(result.cid.multihash) }) })
    .catch((err) => { callback(err) })
})

module.exports = {
  directory: directory,
  cid: cid,
  multihash: multihash
}
