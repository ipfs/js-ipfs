import { createFactory } from 'ipfsd-ctl'
import mergeOpts from 'merge-options'
import { isNode, isBrowser } from 'ipfs-utils/src/env.js'
import * as ipfsHttpModule from 'ipfs-http-client'
import * as ipfsModule from 'ipfs-core'
// @ts-expect-error no types
import goIpfs from 'go-ipfs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { webSockets } from '@libp2p/websockets'
import { all as WebSocketsFiltersAll } from '@libp2p/websockets/filters'

const merge = mergeOpts.bind({ ignoreUndefined: true })
let __dirname = ''

if (isNode) {
  __dirname = dirname(fileURLToPath(import.meta.url))
}

const commonOptions = {
  test: true,
  type: 'proc',
  ipfsHttpModule,
  ipfsModule,
  ipfsOptions: {
    pass: 'ipfs-is-awesome-software',
    libp2p: {
      dialer: {
        dialTimeout: 60e3 // increase timeout because travis is slow
      },
      transports: [
        webSockets({
          filter: WebSocketsFiltersAll
        })
      ]
    }
  },
  endpoint: process.env.IPFSD_SERVER
}

const commonOverrides = {
  js: {
    ...(isNode
      ? {
          ipfsBin: path.resolve(path.join(__dirname, '../../src/cli.js'))
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
    ipfsBin: isNode ? goIpfs.path() : undefined
  }
}

export const factory = (options = {}, overrides = {}) => {
  return createFactory(
    merge(commonOptions, options),
    merge(commonOverrides, overrides)
  )
}
