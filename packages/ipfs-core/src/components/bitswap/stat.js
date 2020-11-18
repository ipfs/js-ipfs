'use strict'

const Big = require('bignumber.js').default
const CID = require('cids')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('..').IPFSBitSwap} config.bitswap
 */
module.exports = ({ bitswap }) => {
  /**
   * Show diagnostic information on the bitswap agent.
   * Note: `bitswap.stat` and `stats.bitswap` can be used interchangeably.
   *
   * @param {import('../../utils').AbortOptions} [_options]
   * @returns {Promise<BitswapStats>}
   *
   * @example
   * ```js
   * const stats = await ipfs.bitswap.stat()
   * console.log(stats)
   * // {
   * //   provideBufLen: 0,
   * //   wantlist: [ CID('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM') ],
   * //   peers:
   * //    [ 'QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
   * //      'QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
   * //      'QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd' ],
   * //   blocksReceived: 0,
   * //   dataReceived: 0,
   * //   blocksSent: 0,
   * //   dataSent: 0,
   * //   dupBlksReceived: 0,
   * //   dupDataReceived: 0
   * // }
   * ```
   */
  async function stat (_options) { // eslint-disable-line require-await
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

/**
 * @typedef {object} BitswapStats - An object that contains information about the bitswap agent
 * @property {number} provideBufLen - an integer
 * @property {CID[]} wantlist
 * @property {string[]} peers - array of peer IDs as Strings
 * @property {Big} blocksReceived
 * @property {Big} dataReceived
 * @property {Big} blocksSent
 * @property {Big} dataSent
 * @property {Big} dupBlksReceived
 * @property {Big} dupDataReceived
 *
 * @typedef {import('..').CID} CID
 */
