/* eslint-env mocha */
/* globals apiClients */
'use strict'

const test = require('interface-ipfs-core')

const common = {
  setup: function (cb) {
    cb(null, apiClients.a)
  },
  teardown: function (cb) {
    cb()
  }
}

test.files(common)
