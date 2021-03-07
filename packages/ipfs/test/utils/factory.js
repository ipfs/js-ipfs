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
  endpoint: process.env.IPFSD_SERVER
}

const commonOverrides = {
  js: {
    ...(isNode
      ? {
          ipfsBin: require.resolve('../../src/cli.js')
        }
      : {}),
    ...(isBrowser
      ? {
          remote: true
        }
      : {})
  },
  proc: {
    ...(isBrowser
      ? {
          ipfsOptions: {
            config: {
              Addresses: {
                Swarm: [
                  process.env.SIGNALA_SERVER
                ]
              }
            }
          }
        }
      : {})
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
