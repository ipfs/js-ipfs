'use strict'
const { createFactory } = require('ipfsd-ctl')
const merge = require('merge-options')

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
    }
  }, overrides)
)

module.exports = factory
