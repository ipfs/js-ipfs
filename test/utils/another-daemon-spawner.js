/* eslint-env mocha */

'use strict'

const waterfall = require('async/waterfall')
const series = require('async/series')

const relayConfig = require('./ipfs-factory-daemon/default-config.json')
const Factory = require('./ipfs-factory-daemon')
const GoDaemon = require('./interop-daemon-spawner/go')

const nodes = []
const factory = new Factory()
exports = module.exports

exports.spawnGoNode = (addrs, hop, api, gateway, callback) => {
  if (typeof hop === 'function') {
    callback = hop
    hop = false
  }
  if (typeof api === 'function') {
    callback = api
    api = 0
  }
  if (typeof gateway === 'function') {
    callback = gateway
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
      return callback(err)
    }
    daemon.api.id((err, id) => {
      if (err) {
        return callback(err)
      }
      nodes.push(daemon)
      callback(null, daemon, id.addresses)
    })
  })
}

exports.spawnJsNode = (addrs, hop, api, gateway, callback) => {
  let relayPeer
  let relayAddrs

  if (typeof hop === 'function') {
    callback = hop
    hop = false
  }
  if (typeof api === 'function') {
    callback = api
    api = 0
  }
  if (typeof gateway === 'function') {
    callback = gateway
    gateway = 0
  }

  api = api || 0
  gateway = gateway || 0

  callback = callback || function noop () {}

  waterfall([
    (cb) => factory.spawnNode(null, Object.assign(relayConfig, {
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
    }), cb),
    (node, cb) => {
      relayPeer = node
      relayPeer.swarm.localAddrs(cb)
    },
    (addrs, cb) => {
      relayAddrs = addrs
      cb()
    }
  ], (err) => {
    if (err) {
      return callback(err)
    }
    callback(null, relayPeer, relayAddrs)
  })
}

exports.stopNodes = (callback) => {
  series([
    (cb) => factory.dismantle(cb)
  ].concat(nodes.map((node) => (cb) => {
    setTimeout(() => node.stop(cb), 100)
  })), callback)
}
