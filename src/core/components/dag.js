'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const pull = require('pull-stream')
const _ = require('lodash')
const once = require('once')

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

    // TODO - move to IPLD resolver and generalize to other IPLD formats
    _getRecursive: promisify((multihash, callback) => {
      // gets flat array of all DAGNodes in tree given by multihash
      callback = once(callback)
      self.dag.get(new CID(multihash), (err, res) => {
        if (err) { return callback(err) }
        const links = res.value.links
        const nodes = [res.value]
        // leaf case
        if (!links.length) {
          return callback(null, nodes)
        }
        // branch case
        links.forEach(link => {
          self.dag._getRecursive(link.multihash, (err, subNodes) => {
            if (err) { return callback(err) }
            nodes.push(subNodes)
            if (nodes.length === links.length + 1) {
              return callback(null, _.flattenDeep(nodes))
            }
          })
        })
      })
    })
  }
}
