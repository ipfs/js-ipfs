'use strict'

const { CID } = require('multiformats/cid')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/bitswap').API<HTTPClientExtraOptions>} BitswapAPI
 */

module.exports = configure(api => {
  /**
   * @type {BitswapAPI["stat"]}
   */
  async function stat (options = {}) {
    const res = await api.post('bitswap/stat', {
      searchParams: toUrlSearchParams(options),
      signal: options.signal,
      headers: options.headers
    })

    return toCoreInterface(await res.json())
  }
  return stat
})

/**
 * @param {any} res
 */
function toCoreInterface (res) {
  return {
    provideBufLen: res.ProvideBufLen,
    wantlist: (res.Wantlist || []).map((/** @type {{ '/': string }} */ k) => CID.parse(k['/'])),
    peers: (res.Peers || []),
    blocksReceived: BigInt(res.BlocksReceived),
    dataReceived: BigInt(res.DataReceived),
    blocksSent: BigInt(res.BlocksSent),
    dataSent: BigInt(res.DataSent),
    dupBlksReceived: BigInt(res.DupBlksReceived),
    dupDataReceived: BigInt(res.DupDataReceived)
  }
}
