'use strict'

const waterfall = require('async/waterfall')
const Key = require('interface-datastore').Key
const bs58 = require('bs58')
const CID = require('cids')
const log = require('debug')('mfs:utils')

const MFS_ROOT_KEY = new Key('/local/filesroot')
const FILE_SEPARATOR = '/'

const validatePath = (path) => {
  path = (path || '').trim()

  if (!path) {
    throw new Error('paths must not be empty')
  }

  if (path.substring(0, 1) !== FILE_SEPARATOR) {
    throw new Error(`paths must start with a leading ${FILE_SEPARATOR}`)
  }

  if (path.substring(path.length - FILE_SEPARATOR.length) === FILE_SEPARATOR) {
    path = path.substring(0, path.length - FILE_SEPARATOR.length)
  }

  return path
}

const withMfsRoot = (ipfs, callback) => {
  const repo = ipfs._repo
  const datastore = repo && repo.datastore

  if (!repo || !datastore) {
    return callback(new Error('Please run jsipfs init first'))
  }

  waterfall([
    // Open the repo if it's been closed
    (cb) => repo.closed ? datastore.open(cb) : cb(),
    (cb) => {
      // Load the MFS root CID
      datastore.get(MFS_ROOT_KEY, (error, result) => {
        if (error && error.notFound) {
          log('Creating new mfs root')

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
    (hash, cb) => cb(null, new CID(hash))
    // Invoke the API function with the root CID
  ], callback)
}

const updateMfsRoot = (ipfs, buffer, callback) => {
  const repo = ipfs._repo
  const datastore = repo && repo.datastore

  if (!repo || !datastore) {
    return callback(new Error('Please run jsipfs init first'))
  }

  if (!Buffer.isBuffer(buffer)) {
    buffer = bs58.encode(buffer)
  }

  waterfall([
    (cb) => repo.closed ? datastore.open(cb) : cb(),
    (cb) => datastore.put(MFS_ROOT_KEY, buffer, cb)
  ], (error) => callback(error, buffer))
}

module.exports = {
  validatePath,
  withMfsRoot,
  updateMfsRoot,
  FILE_SEPARATOR
}
