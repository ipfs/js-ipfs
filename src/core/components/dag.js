'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const pull = require('pull-stream')
const mapAsync = require('async/map')
const flattenDeep = require('lodash.flattendeep')

module.exports = function dag (self) {
  return {
    put: promisify((dagNode, options, callback) => {
      self._ipld.put(dagNode, options, callback)
    }),

    get: promisify((cid, path, options, callback) => {
      if (typeof path === 'function') {
        callback = path
        path = undefined
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (typeof cid === 'string') {
        const split = cid.split('/')
        cid = new CID(split[0])
        split.shift()

        if (split.length > 0) {
          path = split.join('/')
        } else {
          path = '/'
        }
      } else if (Buffer.isBuffer(cid)) {
        try {
          cid = new CID(cid)
        } catch (err) {
          callback(err)
        }
      }

      self._ipld.get(cid, path, options, callback)
    }),

    tree: promisify((cid, path, options, callback) => {
      if (typeof path === 'object') {
        callback = options
        options = path
        path = undefined
      }

      if (typeof path === 'function') {
        callback = path
        path = undefined
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (typeof cid === 'string') {
        const split = cid.split('/')
        cid = new CID(split[0])
        split.shift()

        if (split.length > 0) {
          path = split.join('/')
        } else {
          path = undefined
        }
      }

      pull(
        self._ipld.treeStream(cid, path, options),
        pull.collect(callback)
      )
    }),

    // TODO - use IPLD selectors once they are implemented
    _getRecursive: promisify((multihash, callback) => {
      // gets flat array of all DAGNodes in tree given by multihash

      self.dag.get(new CID(multihash), (err, res) => {
        if (err) { return callback(err) }

        mapAsync(res.value.links, (link, cb) => {
          self.dag._getRecursive(link.multihash, cb)
        }, (err, nodes) => {
          // console.log('nodes:', nodes)
          if (err) return callback(err)
          callback(null, flattenDeep([res.value, nodes]))
        })
      })
    })
  }
}
