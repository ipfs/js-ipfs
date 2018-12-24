'use strict'

const Multiaddr = require('multiaddr')
const mafmt = require('mafmt')
const { struct, superstruct } = require('superstruct')
const { optional, list, union } = struct
const s = superstruct({
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
  'multiaddr-ipfs': v => {
    return mafmt.IPFS.matches(v)
      ? true
      : `multiaddr IPFS invalid`
  }
})

const configSchema = s({
  repo: optional(s('object|string')),
  repoOwner: 'boolean?',
  preload: s({
    enabled: 'boolean?',
    addresses: optional(list(['multiaddr'])),
    interval: 'number?'
  }, { enabled: true, interval: 30 * 1000 }),
  init: optional(union(['boolean', s({ bits: 'number?' })])),
  start: 'boolean?',
  local: 'boolean?',
  pass: 'string?',
  relay: 'object?', // relay validates in libp2p
  EXPERIMENTAL: optional(s({
    pubsub: 'boolean?',
    ipnsPubsub: 'boolean?',
    sharding: 'boolean?',
    dht: 'boolean?'
  })),
  connectionManager: 'object?',
  config: optional(s({
    Addresses: s({
      Swarm: optional(list(['multiaddr'])),
      API: 'multiaddr?',
      Gateway: 'multiaddr'
    }),
    Discovery: optional(s({
      MDSN: optional(s({
        Enabled: 'boolean?',
        Interval: 'number?'
      })),
      webRTCStar: optional(s({
        Enabled: 'boolean?'
      })),
      Bootstrap: optional(list(['multiaddr-ipfs']))
    }))
  })),
  libp2p: optional(union(['function', 'object'])) // libp2p validates this
}, {
  repoOwner: true
})
module.exports.validate = (opts) => {
  const [error, options] = configSchema.validate(opts)

  // Improve errors throwed, reduce stack by throwing here and add reason to the message
  if (error) {
    throw new Error(`${error.message}${error.reason ? ' - ' + error.reason : ''}`)
  }

  return options
}
