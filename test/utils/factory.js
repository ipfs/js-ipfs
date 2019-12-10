'use strict'
const { createFactory } = require('ipfsd-ctl')
const merge = require('merge-options')

const factory = (options, overrides) => {
  return createFactory(
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
      },
      ipfsBin: require.resolve('../../src/cli/bin.js')
    }, options),
    merge({
      js: {
        ipfsBin: require.resolve('../../src/cli/bin.js')
      }
    }, overrides)
  )
}
module.exports = factory
