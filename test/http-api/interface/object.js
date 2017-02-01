/* eslint-env mocha */

'use strict'

const test = require('interface-ipfs-core')
const FactoryClient = require('./../../utils/ipfs-factory-daemon')

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

test.object(common)
