'use strict'

const promisify = require('promisify-es6')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
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
      args: cidB58Str,
      qs: {
        'data-encoding': 'base64'
      }
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      const links = result.Links.map(l => new DAGLink(l.Name, l.Size, l.Hash))
      const node = new DAGNode(Buffer.from(result.Data, 'base64'), links)

      cache.set(cidB58Str, node)
      callback(null, node)
    })
  })
}
