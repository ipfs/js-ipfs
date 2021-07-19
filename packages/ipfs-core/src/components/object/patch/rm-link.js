'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../../types').Preload} config.preload
 */
module.exports = ({ repo, preload }) => {
  const get = require('../get')({ repo, preload })
  const put = require('../put')({ repo, preload })

  /**
   * @type {import('ipfs-core-types/src/object/patch').API["rmLink"]}
   */
  async function rmLink (multihash, linkRef, options = {}) {
    const node = await get(multihash, options)
    const name = (typeof linkRef === 'string' ? linkRef : linkRef.Name) || ''

    node.Links = node.Links.filter(l => l.Name !== name)

    return put(node, options)
  }

  return withTimeoutOption(rmLink)
}
