'use strict'

const promisify = require('promisify-es6')
const streamToValueWithTransformer = require('../utils/stream-to-value-with-transformer')

const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

module.exports = (send) => {
  return promisify((cid, opts, callback) => {
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
      // Inconsistent return values in the browser vs node
      if (!Array.isArray(res)) {
        res = [res]
      }

      let responses = []
      res.forEach(result => {
        // 4 = Provider
        if (result.Type !== 4) return
        result.Responses.forEach(response => {
          const peerInfo = new PeerInfo(PeerId.createFromB58String(response.ID))

          if (response.Addrs) {
            response.Addrs.forEach((addr) => {
              const ma = multiaddr(addr)
              peerInfo.multiaddrs.add(ma)
            })
          }

          responses.push(peerInfo)
        })
      })

      callback(null, responses)
    }

    send({
      path: 'dht/findprovs',
      args: cid.toString(),
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      streamToValueWithTransformer(result, handleResult, callback)
    })
  })
}
