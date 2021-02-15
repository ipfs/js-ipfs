'use strict'

const PeerId = require('peer-id')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * @type {import('ipfs-core-types/src/bitswap').API["wantlistForPeer"]}
   */
  async function wantlistForPeer (peerId, options = {}) {
    const { bitswap } = await network.use(options)
    const list = bitswap.wantlistForPeer(PeerId.createFromCID(peerId), options)

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlistForPeer)
}
