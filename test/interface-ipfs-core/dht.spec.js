/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')
const FactoryClient = require('../factory/factory-client')

let fc

const common = {
  setup: function (callback) {
    fc = new FactoryClient()
    callback(null, fc)
  },
  teardown: function (callback) {
    fc.dismantle(callback)
  }
}

test.dht(common)
