'use strict'

const CID = require('cids')
const log = require('debug')('ipfs:mfs:utils:with-mfs-root')
const waterfall = require('async/waterfall')

const {
  MFS_ROOT_KEY
} = require('./constants')

const withMfsRoot = (ipfs, callback) => {
  const repo = ipfs._repo
  const datastore = repo && repo.datastore

  if (!repo || !datastore) {
    return callback(new Error('Please run jsipfs init first'))
  }

  waterfall([
    // Open the repo if it's been closed
    (cb) => datastore.open((error) => cb(error)),
    (cb) => {
      // Load the MFS root CID
      datastore.get(MFS_ROOT_KEY, (error, result) => {
        if (error && error.notFound) {
          log('Creating new MFS root')

          return waterfall([
            // Store an empty node as the root
            (next) => ipfs.files.add({
              path: '/'
            }, next),
            // Turn the hash into a Buffer
            ([{hash}], next) => next(null, new CID(hash)),
            (cid, next) => repo.closed ? datastore.open((error) => next(error, cid)) : next(null, cid),
            // Store the Buffer in the datastore
            (cid, next) => datastore.put(MFS_ROOT_KEY, cid.buffer, (error) => next(error, cid))
          ], cb)
        }

        cb(error, new CID(result))
      })
    },
    // Turn the Buffer into a CID
    (cid, cb) => {
      log(`Fetched MFS root ${cid.toBaseEncodedString()}`)

      cb(null, cid)
    }
    // Invoke the API function with the root CID
  ], callback)
}

module.exports = withMfsRoot
