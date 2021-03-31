'use strict'

const log = require('debug')('ipfs:mfs:utils:update-mfs-root')
const {
  MFS_ROOT_KEY
} = require('../../../utils')
const errCode = require('err-code')

/**
 * @typedef {import('../').MfsContext} MfsContext
 */

/**
 * @param {MfsContext} context
 * @param {import('cids')} cid
 * @param {import('ipfs-core-types/src/utils').AbortOptions} options
 */
const updateMfsRoot = async (context, cid, options) => {
  if (options && options.signal && options.signal.aborted) {
    throw errCode(new Error('Request aborted'), 'ERR_ABORTED', { name: 'Aborted' })
  }

  log(`New MFS root will be ${cid}`)

  await context.repo.datastore.put(MFS_ROOT_KEY, cid.bytes)

  return cid
}

module.exports = updateMfsRoot
