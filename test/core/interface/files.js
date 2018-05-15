/* eslint-env mocha */
'use strict'

const test = require('interface-ipfs-core')
const parallel = require('async/parallel')

const IPFS = require('../../../src')

const IPFSFactory = require('ipfsd-ctl')
const f = IPFSFactory.create({ type: 'proc', exec: IPFS })

const nodes = []
const common = {
  setup: function (callback) {
    callback(null, {
      spawnNode: (cb) => {
        f.spawn({
          initOptions: {
            bits: 512
          }
        }, (err, _ipfsd) => {
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
    parallel(nodes.map((node) => (cb) => node.stop(cb)), callback)
  }
}

test.files(common)
