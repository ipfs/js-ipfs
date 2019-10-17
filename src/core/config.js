'use strict'

const Multiaddr = require('multiaddr')
const mafmt = require('mafmt')
const { struct, superstruct } = require('superstruct')
const { isTest } = require('ipfs-utils/src/env')

const { optional, union } = struct
const s = superstruct({
  types: {
    multiaddr: v => {
      if (v === null) {
        return `multiaddr invalid, value must be a string, Buffer, or another Multiaddr got ${v}`
      }

      try {
        Multiaddr(v)
      } catch (err) {
        return `multiaddr invalid, ${err.message}`
      }

      return true
    },
    'multiaddr-ipfs': v => mafmt.IPFS.matches(v) ? true : 'multiaddr IPFS invalid'
  }
})

const configSchema = s({
  repo: optional(s('object|string')),
  repoOwner: 'boolean?',
  preload: s({
    enabled: 'boolean?',
    addresses: optional(s(['multiaddr'])),
    interval: 'number?'
  }, { enabled: !isTest, interval: 30 * 1000 }),
  init: optional(union(['boolean', s({
    bits: 'number?',
    emptyRepo: 'boolean?',
    privateKey: optional(s('object|string')), // object should be a custom type for PeerId using 'kind-of'
    pass: 'string?',
    profiles: 'array?'
  })])),
  start: 'boolean?',
  offline: 'boolean?',
  pass: 'string?',
  silent: 'boolean?',
  relay: 'object?', // relay validates in libp2p
  EXPERIMENTAL: optional(s({
    pubsub: 'boolean?',
    ipnsPubsub: 'boolean?',
    sharding: 'boolean?',
    dht: 'boolean?'
  })),
  connectionManager: 'object?',
  config: optional(s({
    API: 'object?',
    Addresses: optional(s({
      Delegates: optional(s(['multiaddr'])),
      Swarm: optional(s(['multiaddr'])),
      API: optional(union([s('multiaddr'), s(['multiaddr'])])),
      Gateway: optional(union([s('multiaddr'), s(['multiaddr'])]))
    })),
    Discovery: optional(s({
      MDNS: optional(s({
        Enabled: 'boolean?',
        Interval: 'number?'
      })),
      webRTCStar: optional(s({
        Enabled: 'boolean?'
      }))
    })),
    Bootstrap: optional(s(['multiaddr-ipfs'])),
    Pubsub: optional(s({
      Router: 'string?',
      Enabled: 'boolean?'
    })),
    Swarm: optional(s({
      ConnMgr: optional(s({
        LowWater: 'number?',
        HighWater: 'number?'
      }))
    }))
  })),
  ipld: 'object?',
  libp2p: optional(union(['function', 'object'])) // libp2p validates this
}, {
  repoOwner: true
})

const validate = (opts) => {
  const [err, options] = configSchema.validate(opts)

  if (err) {
    throw err
  }

  return options
}

module.exports = { validate }
