/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')
const IPFS = require('../../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc' })

const common = {
  setup: function (callback) {
    callback(null, df, IPFS)
  }
}

test.pubsub(common)
