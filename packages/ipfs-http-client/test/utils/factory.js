'use strict'

const { createFactory } = require('ipfsd-ctl')
const merge = require('merge-options')
const { isNode } = require('ipfs-utils/src/env')

const commonOptions = {
  test: true,
  type: 'go',
  ipfsHttpModule: require('../../src'),
  endpoint: 'http://localhost:48372'
}

const commonOverrides = {
  go: {
    ipfsBin: isNode ? require('go-ipfs').path() : undefined
  }
}

const factory = (options = {}, overrides = {}) => createFactory(
  merge(commonOptions, options),
  merge(commonOverrides, overrides)
)

module.exports = factory
