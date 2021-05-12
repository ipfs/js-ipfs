'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../../types').Preload} config.preload
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API["rmLink"]}
   */
  async function rmLink (multihash, linkRef, options = {}) {
    const node = await get(multihash, options)
    // @ts-ignore - loose input types
    node.rmLink(linkRef.Name || linkRef.name || linkRef)
    return put(node, options)
  }

  return withTimeoutOption(rmLink)
}
