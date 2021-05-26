'use strict'

/**
 * @param {Object} config
 * @param {import('../types').NetworkService} config.network
 */
module.exports = ({ network }) =>
  /**
   * @returns {boolean}
   */
  () => {
    const net = network.try()
    return net != null && Boolean(net.libp2p.isStarted())
  }
