import { createFactory } from 'ipfsd-ctl'
import mergeOpts from 'merge-options'
import { isNode } from 'ipfs-utils/src/env.js'
import * as ipfsHttpModule from '../../src/index.js'
// @ts-expect-error go-ipfs has no types
import { path } from 'go-ipfs'

const merge = mergeOpts.bind({ ignoreUndefined: true })

const commonOptions = {
  test: true,
  type: 'go',
  ipfsHttpModule,
  endpoint: process.env.IPFSD_SERVER
}

const commonOverrides = {
  go: {
    ipfsBin: isNode ? (process.env.IPFS_GO_EXEC || path()) : undefined
  }
}

export const factory = (options = {}, overrides = {}) => createFactory(
  merge(commonOptions, options),
  merge(commonOverrides, overrides)
)
