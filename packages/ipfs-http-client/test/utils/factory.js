'use strict'

// @ts-ignore no types
const { createFactory } = require('ipfsd-ctl')
const merge = require('merge-options')
const { isNode } = require('ipfs-utils/src/env')

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
