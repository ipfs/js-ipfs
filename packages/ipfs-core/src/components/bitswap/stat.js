'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('../../types').NetworkService} config.network
 */
module.exports = ({ network }) => {
  /**
   * @type {import('ipfs-core-types/src/bitswap').API["stat"]}
   */
  async function stat (options = {}) {
    /** @type {import('ipfs-bitswap')} */
    const bitswap = (await network.use(options)).bitswap
    const snapshot = bitswap.stat().snapshot

    return {
      provideBufLen: parseInt(snapshot.providesBufferLength.toString()),
      blocksReceived: BigInt(snapshot.blocksReceived.toString()),
      wantlist: Array.from(bitswap.getWantlist()).map(e => e[1].cid),
      peers: bitswap.peers().map(id => id.toB58String()),
      dupBlksReceived: BigInt(snapshot.dupBlksReceived.toString()),
      dupDataReceived: BigInt(snapshot.dupDataReceived.toString()),
      dataReceived: BigInt(snapshot.dataReceived.toString()),
      blocksSent: BigInt(snapshot.blocksSent.toString()),
      dataSent: BigInt(snapshot.dataSent.toString())
    }
  }

  return withTimeoutOption(stat)
}
