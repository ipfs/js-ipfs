'use strict'

const promisify = require('promisify-es6')
const { DAGLink } = require('ipld-dag-pb')
const CID = require('cids')
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = new LRU(lruOptions)

module.exports = (send) => {
  return promisify((cid, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    if (!options) {
      options = {}
    }

    try {
      cid = new CID(cid)
    } catch (err) {
      return callback(err)
    }

    const node = cache.get(cid.toString())

    if (node) {
      return callback(null, node.links)
    }

    send({
      path: 'object/links',
      args: cid.toString()
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      let links = []

      if (result.Links) {
        links = result.Links.map((l) => {
          return new DAGLink(l.Name, l.Size, l.Hash)
        })
      }
      callback(null, links)
    })
  })
}
