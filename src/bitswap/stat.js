'use strict'

const promisify = require('promisify-es6')
const Big = require('big.js')

const transform = function (res, callback) {
  callback(null, {
    provideBufLen: res.ProvideBufLen,
    wantlist: res.Wantlist || [],
    peers: res.Peers || [],
    blocksReceived: new Big(res.BlocksReceived),
    dataReceived: new Big(res.DataReceived),
    blocksSent: new Big(res.BlocksSent),
    dataSent: new Big(res.DataSent),
    dupBlksReceived: new Big(res.DupBlksReceived),
    dupDataReceived: new Big(res.DupDataReceived)
  })
}

module.exports = (send) => {
  return promisify((callback) => {
    send.andTransform({
      path: 'bitswap/stat'
    }, transform, callback)
  })
}
