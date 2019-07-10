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
      if (Array.isArray(res)) {
        res = res.find(r => r.Type === 4)
      }

      // callback with an empty array if no providers are found
      // 4 = Provider
      // https://github.com/libp2p/go-libp2p-core/blob/6e566d10f4a5447317a66d64c7459954b969bdab/routing/query.go#L20
      if (!res || res.Type !== 4) {
        return callback(null, [])
      }

      const responses = res.Responses.map((r) => {
        const peerInfo = new PeerInfo(PeerId.createFromB58String(r.ID))

        if (r.Addrs) {
          r.Addrs.forEach((addr) => {
            const ma = multiaddr(addr)

            peerInfo.multiaddrs.add(ma)
          })
        }

        return peerInfo
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
