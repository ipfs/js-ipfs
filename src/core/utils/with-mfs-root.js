'use strict'

const bs58 = require('bs58')
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
            ([{hash}], next) => next(null, bs58.decode(hash)),
            (buffer, next) => repo.closed ? datastore.open((error) => next(error, buffer)) : next(null, buffer),
            // Store the Buffer in the datastore
            (buffer, next) => datastore.put(MFS_ROOT_KEY, buffer, (error) => next(error, buffer))
          ], cb)
        }

        cb(error, result)
      })
    },
    // Turn the Buffer into a CID
    (hash, cb) => {
      log(`Fetched MFS root ${bs58.encode(hash)}`)

      cb(null, new CID(hash))
    }
    // Invoke the API function with the root CID
  ], callback)
}

module.exports = withMfsRoot
