'use strict'

const waterfall = require('async/waterfall')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const collect = require('pull-stream/sinks/collect')
const importer = require('ipfs-unixfs-engine').importer
const {
  loadNode
} = require('../utils')

const defaultOptions = {
  progress: undefined,
  hash: undefined,
  cidVersion: undefined,
  strategy: undefined
}

const importStream = (ipfs, source, options, callback) => {
  options = Object.assign({}, defaultOptions, options)

  waterfall([
    (cb) => pull(
      values([{
        content: pull(source)
      }]),
      importer(ipfs._ipld, {
        progress: options.progress,
        hashAlg: options.hash,
        cidVersion: options.cidVersion,
        strategy: options.strategy,
        rawLeafNodes: true,
        reduceSingleLeafToSelf: false
      }),
      collect(cb)
    ),
    (results, cb) => {
      return loadNode(ipfs, results[0], cb)
    }
  ], callback)
}

module.exports = importStream
