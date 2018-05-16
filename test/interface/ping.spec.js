/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const test = require('interface-ipfs-core')
const parallel = require('async/parallel')

const IPFSApi = require('../../src')
const f = require('../utils/factory')

const nodes = []
const common = {
  setup: function (callback) {
    callback(null, {
      spawnNode: (cb) => {
        f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
          if (err) {
            return cb(err)
          }

          nodes.push(_ipfsd)
          cb(null, IPFSApi(_ipfsd.apiAddr))
        })
      }
    })
  },
  teardown: function (callback) {
    parallel(nodes.map((node) => (cb) => node.stop(cb)), callback)
  }
}

test.ping(common)
