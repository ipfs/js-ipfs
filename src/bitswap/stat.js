'use strict'

const configure = require('../lib/configure')
const Big = require('bignumber.js')
const CID = require('cids')

module.exports = configure(({ ky }) => {
  return async (options) => {
    options = options || {}

    const res = await ky.post('bitswap/stat', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return toCoreInterface(res)
  }
})

function toCoreInterface (res) {
  return {
    provideBufLen: res.ProvideBufLen,
    wantlist: (res.Wantlist || []).map(k => new CID(k['/'])),
    peers: (res.Peers || []),
    blocksReceived: new Big(res.BlocksReceived),
    dataReceived: new Big(res.DataReceived),
    blocksSent: new Big(res.BlocksSent),
    dataSent: new Big(res.DataSent),
    dupBlksReceived: new Big(res.DupBlksReceived),
    dupDataReceived: new Big(res.DupDataReceived)
  }
}
