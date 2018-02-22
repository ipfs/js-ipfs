/* eslint-env mocha */

'use strict'

const test = require('interface-ipfs-core')
const parallel = require('async/parallel')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })
const options = {
  args: ['--pass', 'ipfs-is-awesome-software'],
  initOptions: { bits: 512 }
}

const nodes = []
const common = {
  setup: function (callback) {
    callback(null, {
      spawnNode: (cb) => {
        df.spawn(options, (err, _ipfsd) => {
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

test.key(common)
