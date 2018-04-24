'use strict'

const bs58 = require('bs58')
const log = require('debug')('mfs:utils:update-mfs:root')
const waterfall = require('async/waterfall')
const {
  MFS_ROOT_KEY
} = require('./constants')

const updateMfsRoot = (ipfs, buffer, callback) => {
  const repo = ipfs._repo
  const datastore = repo && repo.datastore

  if (!repo || !datastore) {
    return callback(new Error('Please run jsipfs init first'))
  }

  if (typeof buffer === 'string' || buffer instanceof String) {
    buffer = bs58.decode(buffer)
  }

  log(`New MFS root will be ${bs58.encode(buffer)}`)

  waterfall([
    (cb) => repo.closed ? datastore.open(cb) : cb(),
    (cb) => datastore.put(MFS_ROOT_KEY, buffer, cb)
  ], (error) => callback(error, buffer))
}

module.exports = updateMfsRoot
