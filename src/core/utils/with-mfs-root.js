'use strict'

const CID = require('cids')
const UnixFs = require('ipfs-unixfs')
const {
  DAGNode
} = require('ipld-dag-pb')
const log = require('debug')('ipfs:mfs:utils:with-mfs-root')
const waterfall = require('async/waterfall')

const {
  MFS_ROOT_KEY
} = require('./constants')

const withMfsRoot = (context, callback) => {
  waterfall([
    // Open the repo if it's been closed
    (cb) => context.repo.datastore.open((error) => cb(error)),
    (cb) => {
      // Load the MFS root CID
      context.repo.datastore.get(MFS_ROOT_KEY, (error, result) => {
        // Once datastore-level releases its error.code addition, we can remove error.notFound logic
        if (error && (error.notFound || error.code === 'ERR_NOT_FOUND')) {
          log('Creating new MFS root')

          return waterfall([
            // Store an empty node as the root
            (next) => DAGNode.create(new UnixFs('directory').marshal(), next),
            (node, next) => context.ipld.put(node, {
              version: 0,
              hashAlg: 'sha2-256',
              format: 'dag-pb'
            }, next),
            // Store the Buffer in the datastore
            (cid, next) => context.repo.datastore.put(MFS_ROOT_KEY, cid.buffer, (error) => next(error, cid))
          ], cb)
        }

        cb(error, result ? new CID(result) : null)
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
