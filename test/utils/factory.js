'use strict'
const { createFactory } = require('ipfsd-ctl')
const merge = require('merge-options')
const { isBrowser } = require('ipfs-utils/src/env')

const factory = (options, overrides) => createFactory(
  merge({
    test: true,
    type: 'proc',
    ipfsModule: {
      path: require.resolve('../../src'),
      ref: require('../../src')
    },
    ipfsHttpModule: {
      path: require.resolve('ipfs-http-client'),
      ref: require('ipfs-http-client')
    }
  }, options),
  merge({
    js: {
      ipfsBin: './src/cli/bin.js'
    },
    proc: {
      ...(isBrowser ? {
        ipfsOptions: {
          config: {
            Addresses: {
              Swarm: [
                '/ip4/127.0.0.1/tcp/14579/wss/p2p-webrtc-star'
              ]
            }
          }
        }
      } : {})
    }
  }, overrides)
)

module.exports = factory
