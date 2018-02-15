/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')
// const parallel = require('async/parallel')

const IPFS = require('../../../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ type: 'proc', exec: IPFS })

const nodes = []
const common = {
  setup: function (callback) {
    callback(null, {
      spawnNode: (cb) => {
        df.spawn((err, _ipfsd) => {
          if (err) {
            return cb(err)
          }

          nodes.push(_ipfsd)
          cb(null, _ipfsd.api)
        })
      }
    })
  },
  teardown: function (callback) {
    // No need to stop, because the test suite does a 'stop' test.
    // parallel(nodes.map((node) => (cb) => node.stop(cb)), callback)
    callback()
  }
}

test.generic(common)
