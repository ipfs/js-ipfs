'use strict'

const waterfall = require('async/waterfall')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const collect = require('pull-stream/sinks/collect')
const importer = require('ipfs-unixfs-engine').importer
const {
  loadNode
} = require('../utils')

const importStream = (ipfs, source, options, callback) => {
  waterfall([
    (cb) => pull(
      values([{
        content: pull(source)
      }]),
      importer(ipfs.dag, {
        progress: options.progress,
        hashAlg: options.hashAlg,
        cidVersion: options.cidVersion,
        strategy: options.strategy,
        rawLeaves: options.rawLeaves,
        reduceSingleLeafToSelf: options.reduceSingleLeafToSelf,
        leafType: options.leafType
      }),
      collect(cb)
    ),
    (results, cb) => loadNode(ipfs, results[0], cb)
  ], callback)
}

module.exports = importStream
