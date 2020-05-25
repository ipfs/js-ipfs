'use strict'

const { BigNumber: Big } = require('bignumber.js')
const CID = require('cids')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('ipfs-bitswap')} BitSwap
 */

/**
 * @typedef {Object} StatConfig
 * @property {BitSwap} bitswap
 *
 * @typedef {Object} BitswapStat
 * @property {number} provideBufLen
 * @property {CID[]} wantlist
 * @property {string[]} peers
 * @property {Big} blocksReceived
 * @property {Big} dataReceived
 * @property {Big} blocksSent
 * @property {Big} dataSent
 * @property {Big} dupBlksReceived
 * @property {Big} dupDataReceived
 *
 * @param {StatConfig} config
 * @returns {Stat}
 */
module.exports = ({ bitswap }) => {
  /**
   * @callback Stat
   * @returns {Promise<BitswapStat>}
   */
  async function stat () { // eslint-disable-line require-await
    // @ts-ignore
    const snapshot = bitswap.stat().snapshot

    return {
      provideBufLen: parseInt(snapshot.providesBufferLength.toString()),
      blocksReceived: new Big(snapshot.blocksReceived),
      // @ts-ignore
      wantlist: Array.from(bitswap.getWantlist()).map(e => e[1].cid),
      // @ts-ignore
      peers: bitswap.peers().map(id => new CID(id.toB58String())),
      dupBlksReceived: new Big(snapshot.dupBlksReceived),
      dupDataReceived: new Big(snapshot.dupDataReceived),
      dataReceived: new Big(snapshot.dataReceived),
      blocksSent: new Big(snapshot.blocksSent),
      dataSent: new Big(snapshot.dataSent)
    }
  }

  return withTimeoutOption(stat)
}
