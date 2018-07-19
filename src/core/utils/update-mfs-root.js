'use strict'

const log = require('debug')('ipfs:mfs:utils:update-mfs:root')
const waterfall = require('async/waterfall')
const CID = require('cids')
const {
  MFS_ROOT_KEY
} = require('./constants')

const updateMfsRoot = (ipfs, buffer, callback) => {
  const repo = ipfs._repo
  const datastore = repo && repo.datastore

  if (!repo || !datastore) {
    return callback(new Error('Please run jsipfs init first'))
  }

  const cid = new CID(buffer)

  log(`New MFS root will be ${cid.toBaseEncodedString()}`)

  waterfall([
    (cb) => {
      if (repo.closed) {
        log('Opening datastore')
        return datastore.open((error) => cb(error))
      }

      log('Datastore was already open')
      cb()
    },
    (cb) => datastore.put(MFS_ROOT_KEY, cid.buffer, (error) => cb(error))
  ], (error) => callback(error, cid))
}

module.exports = updateMfsRoot
