'use strict'

const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const bs58 = require('bs58')
const CID = require('cids')
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = LRU(lruOptions)

module.exports = (send) => {
  return promisify((cid, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (!options) {
      options = {}
    }

    let cidB58Str

    try {
      cid = new CID(cid)
      cidB58Str = cid.toBaseEncodedString()
    } catch (err) {
      return callback(err)
    }

    const node = cache.get(cidB58Str)

    if (node) {
      return callback(null, node)
    }

    send({
      path: 'object/get',
      args: cidB58Str
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      const links = result.Links.map((l) => {
        return new DAGLink(l.Name, l.Size, Buffer.from(bs58.decode(l.Hash)))
      })

      DAGNode.create(result.Data, links, (err, node) => {
        if (err) {
          return callback(err)
        }
        cache.set(cidB58Str, node)
        callback(null, node)
      })
    })
  })
}
