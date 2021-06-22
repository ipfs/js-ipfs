'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { Multiaddr } = require('multiaddr')

/**
 * @param {Object} config
 * @param {import('ipfs-repo')} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/bootstrap').API["list"]}
   */
  async function list (options = {}) {
    /** @type {string[]|null} */
    const peers = (await repo.config.get('Bootstrap', options))
    return { Peers: (peers || []).map(ma => new Multiaddr(ma)) }
  }

  return withTimeoutOption(list)
}
