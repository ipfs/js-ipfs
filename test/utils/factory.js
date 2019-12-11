'use strict'
const { createFactory } = require('ipfsd-ctl')
const { findBin } = require('ipfsd-ctl/src/utils')

const factory = createFactory({
  test: 'true',
  type: 'go',
  ipfsBin: findBin('go'),
  ipfsHttpModule: {
    path: require.resolve('../../src'),
    ref: require('../../src')
  }
})

module.exports = factory
