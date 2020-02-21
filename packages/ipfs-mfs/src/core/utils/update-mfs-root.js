'use strict'

const log = require('debug')('ipfs:mfs:utils:update-mfs-root')
const {
  MFS_ROOT_KEY
} = require('./constants')

const updateMfsRoot = async (context, cid) => {
  log(`New MFS root will be ${cid}`)

  await context.repo.datastore.put(MFS_ROOT_KEY, cid.buffer)

  return cid
}

module.exports = updateMfsRoot
