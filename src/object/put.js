'use strict'

const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = LRU(lruOptions)

module.exports = (send) => {
  return promisify((obj, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    if (!options) {
      options = {}
    }

    let tmpObj = {
      Data: null,
      Links: []
    }

    if (Buffer.isBuffer(obj)) {
      if (!options.enc) {
        tmpObj = {
          Data: obj.toString(),
          Links: []
        }
      }
    } else if (obj.multihash) {
      tmpObj = {
        Data: obj.data.toString(),
        Links: obj.links.map((l) => {
          const link = l.toJSON()
          link.hash = link.multihash
          return link
        })
      }
    } else if (typeof obj === 'object') {
      tmpObj.Data = obj.Data.toString()
      tmpObj.Links = obj.Links
    } else {
      return callback(new Error('obj not recognized'))
    }

    let buf
    if (Buffer.isBuffer(obj) && options.enc) {
      buf = obj
    } else {
      buf = Buffer.from(JSON.stringify(tmpObj))
    }
    const enc = options.enc || 'json'

    send({
      path: 'object/put',
      qs: { inputenc: enc },
      files: buf
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      if (Buffer.isBuffer(obj)) {
        if (!options.enc) {
          obj = { Data: obj, Links: [] }
        } else if (options.enc === 'json') {
          obj = JSON.parse(obj.toString())
        }
      }

      let node

      if (obj.multihash) {
        node = obj
      } else if (options.enc === 'protobuf') {
        dagPB.util.deserialize(obj, (err, _node) => {
          if (err) {
            return callback(err)
          }
          node = _node
          next()
        })
        return
      } else {
        DAGNode.create(Buffer.from(obj.Data), obj.Links, (err, _node) => {
          if (err) {
            return callback(err)
          }
          node = _node
          next()
        })
        return
      }
      next()

      function next () {
        const nodeJSON = node.toJSON()
        if (nodeJSON.multihash !== result.Hash) {
          const err = new Error('multihashes do not match')
          return callback(err)
        }

        cache.set(result.Hash, node)
        callback(null, node)
      }
    })
  })
}
