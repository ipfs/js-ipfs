'use strict'

const promisify = require('promisify-es6')
const multiaddr = require('multiaddr')
const PeerId = require('peer-id')

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    const verbose = opts.v || opts.verbose

    send({
      path: 'swarm/peers',
      qs: opts
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      // go-ipfs <= 0.4.4
      if (result.Strings) {
        return callback(null, result.Strings.map((p) => {
          const res = {}

          if (verbose) {
            const parts = p.split(' ')
            res.addr = multiaddr(parts[0])
            res.latency = parts[1]
          } else {
            res.addr = multiaddr(p)
          }

          res.peer = PeerId.createFromB58String(
            res.addr.decapsulate('ipfs')
          )

          return res
        }))
      }

      // go-ipfs >= 0.4.5
      callback(null, (result.Peers || []).map((p) => {
        const res = {
          addr: multiaddr(p.Addr),
          peer: PeerId.createFromB58String(p.Peer),
          muxer: p.Muxer
        }

        if (p.Latency) {
          res.latency = p.Latency
        }

        if (p.Streams) {
          res.streams = p.Streams
        }

        return res
      }))
    })
  })
}
