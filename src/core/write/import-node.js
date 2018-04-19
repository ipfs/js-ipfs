'use strict'

const {
  waterfall
} = require('async')
const pull = require('pull-stream')
const {
  values,
  collect
} = pull
const importer = require('ipfs-unixfs-engine').importer

const importNode = (ipfs, parent, fileName, buffer, options, callback) => {
  waterfall([
    (done) => pull(
      values([{
        content: buffer
      }]),
      importer(ipfs._ipld, {
        progress: options.progress,
        hashAlg: options.hash,
        cidVersion: options.cidVersion,
        strategy: options.strategy
      }),
      collect(done)
    ),
    (results, done) => {
      const imported = results[0]

      return done(null, {
        size: imported.size,
        multihash: imported.multihash
      })
    }
  ], callback)
}

module.exports = importNode
