
/**
 * @param {object} config
 * @param {import('../types').NetworkService} config.network
 */
export function createIsOnline ({ network }) {
  /**
   * @returns {boolean}
   */
  return () => {
    const net = network.try()
    return net != null && Boolean(net.libp2p.isStarted())
  }
}
