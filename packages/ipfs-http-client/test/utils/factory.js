

// @ts-expect-error no types
import { createFactory } from 'ipfsd-ctl'
import mergeOpts from 'merge-options'
const merge = mergeOpts.bind({ ignoreUndefined: true })
import { isNode } from 'ipfs-utils/src/env.js'

const commonOptions = {
  test: true,
  type: 'go',
  ipfsHttpModule: require('../../src'),
  endpoint: process.env.IPFSD_SERVER
}

const commonOverrides = {
  go: {
    // @ts-ignore go-ipfs has no types
    ipfsBin: isNode ? require('go-ipfs').path() : undefined
  }
}

const factory = (options = {}, overrides = {}) => createFactory(
  merge(commonOptions, options),
  merge(commonOverrides, overrides)
)

module.exports = factory
