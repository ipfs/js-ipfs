'use strict'
const { createFactory } = require('ipfsd-ctl')
const merge = require('merge-options')
const { isNode, isBrowser } = require('ipfs-utils/src/env')

const commonOptions = {
  test: true,
  type: 'proc',
  ipfsHttpModule: require('ipfs-http-client'),
  ipfsModule: require('ipfs-core'),
  ipfsOptions: {
    pass: 'ipfs-is-awesome-software',
    libp2p: {
      dialer: {
        dialTimeout: 60e3 // increase timeout because travis is slow
      }
    }
  },
  endpoint: 'http://localhost:57483'
}

const commonOverrides = {
  js: {
    ...(isNode ? {
      ipfsBin: require.resolve('../../src/cli.js')
    } : {}),
    ...(isBrowser ? {
      remote: true
    } : {})
  },
  proc: {
    ...(isBrowser ? {
      ipfsOptions: {
        config: {
          Addresses: {
            Swarm: [
              '/ip4/127.0.0.1/tcp/14579/ws/p2p-webrtc-star'
            ]
          }
        }
      }
    } : {})
  },
  go: {
    ipfsBin: isNode ? require('go-ipfs').path() : undefined
  }
}

const factory = (options = {}, overrides = {}) => {
  return createFactory(
    merge(commonOptions, options),
    merge(commonOverrides, overrides)
  )
}

module.exports = factory
