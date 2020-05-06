'use strict'

const { BigNumber } = require('bignumber.js')
const CID = require('cids')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('bitswap/stat', {
      searchParams: toUrlSearchParams(options),
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    })

    return toCoreInterface(await res.json())
  }
})

function toCoreInterface (res) {
  return {
    provideBufLen: res.ProvideBufLen,
    wantlist: (res.Wantlist || []).map(k => new CID(k['/'])),
    peers: (res.Peers || []),
    blocksReceived: new BigNumber(res.BlocksReceived),
    dataReceived: new BigNumber(res.DataReceived),
    blocksSent: new BigNumber(res.BlocksSent),
    dataSent: new BigNumber(res.DataSent),
    dupBlksReceived: new BigNumber(res.DupBlksReceived),
    dupDataReceived: new BigNumber(res.DupDataReceived)
  }
}
