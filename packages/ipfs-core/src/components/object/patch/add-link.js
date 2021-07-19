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
   * @type {import('ipfs-core-types/src/object/patch').API["addLink"]}
   */
  async function addLink (cid, link, options = {}) {
    const node = await get(cid, options)

    return put({
      ...node,
      Links: node.Links.concat([link])
    }, options)
  }

  return withTimeoutOption(addLink)
}
