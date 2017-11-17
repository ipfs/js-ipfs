/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const test = require('interface-ipfs-core')
const FactoryClient = require('../ipfs-factory/client')

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

test.pin(common)
