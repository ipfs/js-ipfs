/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')

const IPFS = require('../../src/core')

const common = {
  setup: function (cb) {
    const ipfs = new IPFS(require('./repo-path'))
    ipfs.load(() => {
      cb(null, ipfs)
    })
  },
  teardown: function (cb) {
    cb()
  }
}

test.files(common)
