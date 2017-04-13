/* eslint-env mocha */

'use strict'

const waterfall = require('async/waterfall')
const series = require('async/series')

const relayConfig = require('./ipfs-factory-daemon/default-config.json')
const GoDaemon = require('../interop/daemons/go')
const Factory = require('./ipfs-factory-daemon')

const nodes = []
exports.spawnGoNode = (addrs, hop, api, gateway, cb) => {
  if (typeof hop === 'function') {
    cb = hop
    hop = false
  }
  if (typeof api === 'function') {
    cb = api
    api = 0
  }
  if (typeof gateway === 'function') {
    cb = gateway
    gateway = 0
  }

  api = api || 0
  gateway = gateway || 0

  const daemon = new GoDaemon({
    disposable: true,
    init: true,
    config: {
      Addresses: {
        Swarm: addrs,
        API: `/ip4/0.0.0.0/tcp/${api}`,
        Gateway: `/ip4/0.0.0.0/tcp/${gateway}`
      },
      Swarm: {
        AddrFilters: null,
        DisableBandwidthMetrics: false,
        DisableNatPortMap: false,
        DisableRelay: false,
        EnableRelayHop: hop
      }
    }
  })

  daemon.start((err) => {
    if (err) {
      return cb(err)
    }
    daemon.api.id((err, id) => {
      if (err) {
        return cb(err)
      }
      nodes.push(daemon)
      cb(null, daemon, id.addresses)
    })
  })
}

const factory = new Factory()
exports.spawnJsNode = (addrs, hop, api, gateway, cb) => {
  let relayPeer
  let relayAddrs

  if (typeof hop === 'function') {
    cb = hop
    hop = false
  }
  if (typeof api === 'function') {
    cb = api
    api = 0
  }
  if (typeof gateway === 'function') {
    cb = gateway
    gateway = 0
  }

  api = api || 0
  gateway = gateway || 0

  cb = cb || (() => {})

  waterfall([
    (pCb) => {
      factory.spawnNode(null,
        Object.assign(relayConfig, {
          Addresses: {
            Swarm: addrs,
            API: `/ip4/0.0.0.0/tcp/${api}`,
            Gateway: `/ip4/0.0.0.0/tcp/${gateway}`
          },
          EXPERIMENTAL: {
            Swarm: {
              DisableRelay: false,
              EnableRelayHop: hop
            }
          }
        }), pCb)
    },
    (node, pCb) => {
      relayPeer = node
      pCb()
    },
    (pCb) => relayPeer.swarm.localAddrs(pCb),
    (addrs, pCb) => {
      relayAddrs = addrs
      pCb()
    }
  ], (err) => {
    if (err) {
      return cb(err)
    }
    cb(null, relayPeer, relayAddrs)
  })
}

exports.stopNodes = (callback) => {
  series([
    (cb) => factory.dismantle(cb)
  ].concat(nodes.map((node) => (cb) => {
    setTimeout(() => node.stop(cb), 100)
  })), callback)
}
