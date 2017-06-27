'use strict'

const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const bs58 = require('bs58')
const cleanMultihash = require('../utils/clean-multihash')
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = LRU(lruOptions)

module.exports = (send) => {
  return promisify((multihash, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (!options) {
      options = {}
    }

    try {
      multihash = cleanMultihash(multihash, options)
    } catch (err) {
      return callback(err)
    }

    const node = cache.get(multihash)

    if (node) {
      return callback(null, node)
    }

    send({
      path: 'object/get',
      args: multihash
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      const links = result.Links.map((l) => {
        return new DAGLink(l.Name, l.Size, new Buffer(bs58.decode(l.Hash)))
      })

      DAGNode.create(result.Data, links, (err, node) => {
        if (err) {
          return callback(err)
        }
        cache.set(multihash, node)
        callback(null, node)
      })
    })
  })
}
