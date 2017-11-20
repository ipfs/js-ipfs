'use strict'

const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}

const cache = LRU(lruOptions)
const SendOneFile = require('../utils/send-one-file')
const once = require('once')

module.exports = (send) => {
  const sendOneFile = SendOneFile(send, 'object/put')

  return promisify((obj, options, _callback) => {
    if (typeof options === 'function') {
      _callback = options
      options = {}
    }

    const callback = once(_callback)

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

    const sendOptions = {
      qs: { inputenc: enc }
    }

    sendOneFile(buf, sendOptions, (err, result) => {
      if (err) {
        return callback(err) // early
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
