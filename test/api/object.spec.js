/* eslint-env mocha */
/* globals apiClients */

'use strict'

const test = require('interface-ipfs-core')

const common = {
  setup: function (cb) {
    let c = 0
    cb(null, {
      spawnNode: (path, config, callback) => {
        switch (c) {
          case 0: callback(null, apiClients.a); c++; break
          case 1: callback(null, apiClients.b); c++; break
          case 2: callback(null, apiClients.c); c++; break
          default: callback(new Error('no more nodes available'))
        }
      }
    })
  },
  teardown: function (cb) {
    cb()
  }
}

test.object(common)
