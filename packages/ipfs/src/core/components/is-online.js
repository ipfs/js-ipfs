'use strict'

/**
 * @typedef {import("ipfs-interface").LibP2PService} LibP2P
 */

/**
 * @param {Object} [config]
 * @param {LibP2P} [config.libp2p]
 * @returns {IsOnline}
 */
module.exports = ({ libp2p }) => {
  /**
   * @callback IsOnline
   * @returns {boolean}
   * @type {IsOnline}
   */
  const isOnline = () => Boolean(libp2p && libp2p.isStarted())
  return isOnline
}
