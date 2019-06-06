'use strict'

const mh = require('multihashes')
const promisify = require('promisify-es6')
const CID = require('cids')
const debug = require('debug')
const tryEach = require('async/tryEach')
const waterfall = require('async/waterfall')
const log = debug('jsipfs:http:response:resolver')
log.error = debug('jsipfs:http:response:resolver:error')
const dirView = require('./dir-view')

const INDEX_HTML_FILES = [
  'index.html',
  'index.htm',
  'index.shtml'
]

const findIndexFile = (ipfs, path, callback) => {
  return tryEach(INDEX_HTML_FILES.map(file => {
    return (cb) => {
      waterfall([
        (cb) => ipfs.files.stat(`${path}/${file}`, cb),
        (stats, cb) => cb(null, {
          name: file,
          cid: new CID(stats.hash)
        })
      ], cb)
    }
  }), callback)
}

const directory = promisify((ipfs, path, cid, callback) => {
  // Test if it is a Website
  findIndexFile(ipfs, path, (err, res) => {
    if (err) {
      if (err.message.includes('does not exist')) {
        // not a website, just show a directory listing
        return ipfs.dag.get(cid, (err, result) => {
          if (err) {
            return callback(err)
          }

          return callback(null, dirView.render(path, result.value.Links))
        })
      }

      return callback(err)
    }

    callback(err, [{
      Name: res.name
    }])
  })
})

const cid = promisify((ipfs, path, callback) => {
  ipfs.files.stat(path, (err, stats) => {
    if (err) {
      return callback(err)
    }

    const cid = new CID(stats.hash)

    if (stats.type.includes('directory')) {
      const err = new Error('This dag node is a directory')
      err.cid = cid
      err.fileName = stats.name
      err.dagDirType = stats.type

      return callback(err)
    }

    callback(err, {
      cid
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
