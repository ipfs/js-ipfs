/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'js' })

const common = {
  setup: function (callback) {
    callback(null, df, './src/cli/bin.js')
  }
}

test.block(common)
