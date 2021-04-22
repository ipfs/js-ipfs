'use strict'

const last = require('it-last')
const rmAll = require('./rm-all')

/**
 * @param {import('.').Context} context
 * @param {string|import('cids')} path - CID or IPFS Path to unpin.
 * @param {import('ipfs-core-types/src/pin').RmOptions} [options]
 * @returns {Promise<import('cids')>} - The CIDs that was unpinned
 */
const rm = async (context, path, options) => {
  const cid = await last(rmAll(context, [path], options))
  // last of empty would be undefined, but here we know it won't be so we
  // manually cast type.
  return /** @type {import('cids')} */(cid)
}


module.exports = rm
