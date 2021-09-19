
import { createFactory } from 'ipfsd-ctl'
import mergeOpts from 'merge-options'
import { isNode, isBrowser } from 'ipfs-utils/src/env.js'
const merge = mergeOpts.bind({ ignoreUndefined: true })

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
