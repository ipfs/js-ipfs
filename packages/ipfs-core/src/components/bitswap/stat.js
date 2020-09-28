'use strict'

const Big = require('bignumber.js').default
const CID = require('cids')
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {object} BitswapStats - An object that contains information about the bitswap agent
 * @property {number} provideBufLen - an integer
 * @property {import('cids')[]} wantlist
 * @property {string[]} peers - array of peer IDs as Strings
 * @property {Big} blocksReceived
 * @property {Big} dataReceived
 * @property {Big} blocksSent
 * @property {Big} dataSent
 * @property {Big} dupBlksReceived
 * @property {Big} dupDataReceived
 */

/**
 * Show diagnostic information on the bitswap agent.
 * @template {Record<string, any>} ExtraOptions
 * @callback Stat
 * @param {import('../../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<BitswapStats>}
 */

module.exports = ({ bitswap }) => {
  // eslint-disable-next-line valid-jsdoc
  /**
   * @type {Stat<{}>}
   */
  async function stat (options) { // eslint-disable-line require-await, @typescript-eslint/no-unused-vars
    const snapshot = bitswap.stat().snapshot

    return {
      provideBufLen: parseInt(snapshot.providesBufferLength.toString()),
      blocksReceived: new Big(snapshot.blocksReceived),
      wantlist: Array.from(bitswap.getWantlist()).map(e => e[1].cid),
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
