'use strict'

const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('peer-info')} PeerInfo
 * @typedef {import('multiaddr')} Multiaddr
 * @typedef {import('../../utils').WithTimeoutOptions} WithTimeoutOptions
 */

/**
 * @typedef {Object} Config
 * @property {PeerInfo} peerInfo
 *
 * @param {Config} config
 * @returns {LocalAddrs}
 */
module.exports = ({ peerInfo }) => {
  /**
   * @callback LocalAddrs
   * @returns {Promise<Multiaddr[]>}
   *
   * @type {LocalAddrs}
   */
  async function localAddrs () { // eslint-disable-line require-await
    return peerInfo.multiaddrs.toArray()
  }

  return withTimeoutOption(localAddrs)
}
