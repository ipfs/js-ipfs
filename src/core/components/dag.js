'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const pull = require('pull-stream')

module.exports = function dag (self) {
  return {
    put: promisify((dagNode, options, callback) => {
      self._ipldResolver.put(dagNode, options, callback)
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

      self._ipldResolver.get(cid, path, options, callback)
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
        self._ipldResolver.treeStream(cid, path, options),
        pull.collect(callback)
      )
    })
  }
}
