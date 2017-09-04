'use strict'

const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const cleanMultihash = require('../utils/clean-multihash')
const bs58 = require('bs58')
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
      return callback(null, node.links)
    }

    send({
      path: 'object/links',
      args: multihash
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      let links = []

      if (result.Links) {
        links = result.Links.map((l) => {
          return new DAGLink(l.Name, l.Size, Buffer.from(bs58.decode(l.Hash)))
        })
      }
      callback(null, links)
    })
  })
}
