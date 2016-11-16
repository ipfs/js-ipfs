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
	  if (opts['v']) {
		throw "I don't know how to handle errors in javascript, but the -v option needs to be handled"
	  }
      send({
        path: 'swarm/peers',
        qs: opts
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
		if (result.Strings) {
          callback(null, result.Strings.map((addr) => {
            return multiaddr(addr)
          }))
		} else if (result.Peers) {
		  let out = result.Peers.map((p) => {
			return {
				addr: new multiaddr(p.Addr),
				peer: new PeerId(p.Peer),
				latency: p.Latency,
				streams: p.Streams,
			}
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
