'use strict'

const waterfall = require('async/waterfall')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const collect = require('pull-stream/sinks/collect')
const importer = require('ipfs-unixfs-engine').importer
const {
  limitStreamBytes
} = require('../utils')

const importNode = (ipfs, parent, fileName, source, options, callback) => {
  waterfall([
    (done) => pull(
      values([{
        content: pull(
          source,
          limitStreamBytes(options.length)
        )
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

      done(null, {
        size: imported.size,
        multihash: imported.multihash
      })
    }
  ], callback)
}

module.exports = importNode
