'use strict'

const last = require('it-last')
const addAll = require('./add-all')
const { toPin } = require('ipfs-core-utils/src/pins/normalise-input')
/**
 * @param {import('.').Context} context
 * @param {import('cids')|string} path
 * @param {import('ipfs-core-types/src/pin').AddOptions} [options]
 * @returns {Promise<import('cids')>}
 */
const add = async (context, path, options) => {
  const cid = await last(addAll(context, [toPin(path, options)], options))
  // last of empty would be undefined, but here we know it won't be so we
  // manually cast type.
  return /** @type {import('cids')} */(cid)
}

module.exports = add
