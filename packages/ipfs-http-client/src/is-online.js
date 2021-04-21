'use strict'

const callId = require('./id')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

/**
 * @param {import('./types').Options} options
 */
module.exports = options => {
  const id = callId(options)

  /**
   * @type {RootAPI["isOnline"]}
   */
  async function isOnline (options = {}) {
    const res = await id(options)

    return Boolean(res && res.addresses && res.addresses.length)
  }
  return isOnline
}
