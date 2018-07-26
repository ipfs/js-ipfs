'use strict'

const exporter = require('ipfs-unixfs-engine').exporter
const importer = require('ipfs-unixfs-engine').importer
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const asyncMap = require('pull-stream/throughs/async-map')
const collect = require('pull-stream/sinks/collect')
const log = require('debug')('ipfs:mfs:write:truncate-node')
const {
  loadNode
} = require('../utils')

const truncateNode = (ipfs, dagNode, newLength, options, callback) => {
  log(`Truncating ${dagNode.multihash} to ${newLength} bytes`)

  pull(
    exporter(dagNode.multihash, ipfs.dag, {
      offset: 0,
      length: newLength
    }),
    asyncMap((file, cb) => {
      pull(
        values([{
          content: file.content
        }]),
        importer(ipfs.dag, {
          progress: options.progress,
          hashAlg: options.hash,
          cidVersion: options.cidVersion,
          strategy: options.strategy,
          rawLeaves: options.rawLeaves,
          reduceSingleLeafToSelf: options.reduceSingleLeafToSelf,
          leafType: options.leafType
        }),
        collect(cb)
      )
    }),
    asyncMap((imported, cb) => loadNode(ipfs, imported[0], cb)),
    collect((error, results) => {
      callback(error, results.pop())
    })
  )
}

module.exports = truncateNode
