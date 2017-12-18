/* eslint-env mocha */

'use strict'

const test = require('interface-ipfs-core')
const Factory = require('../ipfs-factory/client')

let factory

const common = {
  setup: function (callback) {
    factory = new Factory()
    callback(null, factory)
  },
  teardown: function (callback) {
    factory.dismantle(callback)
  }
}

test.key(common)
