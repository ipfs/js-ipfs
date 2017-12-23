/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

const common = {
  setup: function (callback) {
    callback(null, df)
  }
}

test.block(common)
