'use strict'

const promisify = require('promisify-es6')

const transform = function (res, callback) {
  callback(null, {
    provideBufLen: res.ProvideBufLen,
    wantlist: res.Wantlist,
    peers: res.Peers,
    blocksReceived: res.BlocksReceived,
    dataReceived: res.DataReceived,
    blocksSent: res.BlocksSent,
    dataSent: res.DataSent,
    dupBlksReceived: res.DupBlksReceived,
    dupDataReceived: res.DupDataReceived
  })
}

module.exports = (send) => {
  return promisify((callback) => {
    send.andTransform({
      path: 'bitswap/stat'
    }, transform, callback)
  })
}
