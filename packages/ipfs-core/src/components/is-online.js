'use strict'

/**
 * @param {Object} config
 * @param {import('.').NetworkService} config.network
 */
module.exports = ({ network }) =>
  /**
   * @returns {boolean}
   */
  () => {
    const net = network.try()
    return net != null && net.libp2p.isStarted()
  }
