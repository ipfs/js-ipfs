'use strict'

const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')

const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')
const errcode = require('err-code')

module.exports = (send) => {
  return promisify((peerId, opts, callback) => {
    if (typeof opts === 'function' && !callback) {
      callback = opts
      opts = {}
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' && typeof callback === 'function') {
      callback = opts
      opts = {}
    }

    const handleResult = (res, callback) => {
      // Inconsistent return values in the browser
      if (Array.isArray(res)) {
        res = res[0]
      }

      // Type 2 keys
      if (res.Type !== 2) {
        const errMsg = `key was not found (type 2)`

        return callback(errcode(new Error(errMsg), 'ERR_KEY_TYPE_2_NOT_FOUND'))
      }

      const responseReceived = res.Responses[0]
      const peerInfo = new PeerInfo(PeerId.createFromB58String(responseReceived.ID))

      responseReceived.Addrs.forEach((addr) => {
        const ma = multiaddr(addr)

        peerInfo.multiaddrs.add(ma)
      })

      callback(null, peerInfo)
    }

    send({
      path: 'dht/findpeer',
      args: peerId,
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, handleResult, callback)
    })
  })
}
