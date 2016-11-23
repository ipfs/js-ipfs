'use strict'

const promisify = require('promisify-es6')
const multiaddr = require('multiaddr')
const PeerId = require('peer-id')
const PeerInfo = require('peer-info')

module.exports = (send) => {
  return {
    peers: promisify((opts, callback) => {
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

        if (result.Strings) {
          // go-ipfs <= 0.4.4
          callback(null, result.Strings.map((p) => {
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
        } else if (result.Peers) {
          // go-ipfs >= 0.4.5
          callback(null, result.Peers.map((p) => {
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
        }
      })
    }),
    connect: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/connect',
        args: args,
        qs: opts
      }, callback)
    }),
    disconnect: promisify((args, opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/disconnect',
        args: args,
        qs: opts
      }, callback)
    }),
    addrs: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/addrs',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        const peers = Object.keys(result.Addrs).map((id) => {
          const info = new PeerInfo(PeerId.createFromB58String(id))
          result.Addrs[id].forEach((addr) => {
            info.multiaddr.add(multiaddr(addr))
          })

          return info
        })

        callback(null, peers)
      })
    }),
    localAddrs: promisify((opts, callback) => {
      if (typeof (opts) === 'function') {
        callback = opts
        opts = {}
      }
      send({
        path: 'swarm/addrs/local',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result.Strings.map((addr) => {
          return multiaddr(addr)
        }))
      })
    })
  }
}
