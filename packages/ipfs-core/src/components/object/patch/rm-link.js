'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ ipld, gcLock, preload }) => {
  const get = require('../get')({ ipld, preload })
  const put = require('../put')({ ipld, gcLock, preload })

  async function rmLink (multihash, linkRef, options) {
    const node = await get(multihash, options)
    node.rmLink(linkRef.Name || linkRef.name)
    return put(node, options)
  }

  return withTimeoutOption(rmLink)
}
