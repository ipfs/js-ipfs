/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')
const IPFS = require('../../../src/core')

// let factory

const common = {
  setup: function (cb) {
    // TODO change to factory
    const ipfs = new IPFS(require('../../utils/repo-path'))
    ipfs.load(() => {
      cb(null, ipfs)
    })
  },
  teardown: function (cb) {
    // factory.teardown
    cb()
  }
}

test.files(common)
