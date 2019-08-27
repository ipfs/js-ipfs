'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const pull = require('pull-stream')
const iterToPull = require('async-iterator-to-pull-stream')
const setImmediate = require('async/setImmediate')
const errCode = require('err-code')
const multicodec = require('multicodec')

module.exports = function dag (self) {
  return {
    put: promisify((dagNode, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      if (options.cid && (options.format || options.hashAlg)) {
        return callback(new Error('Can\'t put dag node. Please provide either `cid` OR `format` and `hashAlg` options.'))
      } else if (((options.format && !options.hashAlg) || (!options.format && options.hashAlg))) {
        return callback(new Error('Can\'t put dag node. Please provide `format` AND `hashAlg` options.'))
      }

      const optionDefaults = {
        format: multicodec.DAG_CBOR,
        hashAlg: multicodec.SHA2_256
      }

      // The IPLD expects the format and hashAlg as constants
      if (options.format && typeof options.format === 'string') {
        const constantName = options.format.toUpperCase().replace(/-/g, '_')
        options.format = multicodec[constantName]
      }
      if (options.hashAlg && typeof options.hashAlg === 'string') {
        const constantName = options.hashAlg.toUpperCase().replace(/-/g, '_')
        options.hashAlg = multicodec[constantName]
      }

      options = options.cid ? options : Object.assign({}, optionDefaults, options)

      // js-ipld defaults to verion 1 CIDs. Hence set version 0 explicitly for
      // dag-pb nodes
      if (options.version === undefined) {
        if (options.format === multicodec.DAG_PB && options.hashAlg === multicodec.SHA2_256) {
          options.version = 0
        } else {
          options.version = 1
        }
      }

      self._ipld.put(dagNode, options.format, {
        hashAlg: options.hashAlg,
        cidVersion: options.version
      }).then(
        (cid) => {
          if (options.preload !== false) {
            self._preload(cid)
          }
          return callback(null, cid)
        },
        (error) => callback(error)
      )
    }),

    get: promisify((cid, path, options, callback) => {
      if (typeof path === 'function') {
        callback = path
        path = undefined
      }

      if (typeof options === 'function') {
        callback = options

        // Allow options in path position
        if (typeof path !== 'string') {
          options = path
          path = undefined
        } else {
          options = {}
        }
      }

      options = options || {}

      if (typeof cid === 'string') {
        const split = cid.split('/')

        try {
          cid = new CID(split[0])
        } catch (err) {
          return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
        }

        split.shift()

        if (split.length > 0) {
          path = split.join('/')
        } else {
          path = path || '/'
        }
      } else if (Buffer.isBuffer(cid)) {
        try {
          cid = new CID(cid)
        } catch (err) {
          return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
        }
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      if (path == null || path === '/') {
        self._ipld.get(cid).then(
          (value) => {
            callback(null, {
              value,
              remainderPath: ''
            })
          },
          (error) => callback(error)
        )
      } else {
        const result = self._ipld.resolve(cid, path)
        const promisedValue = options.localResolve ? result.first() : result.last()
        promisedValue.then(
          (value) => callback(null, value),
          (error) => callback(error)
        )
      }
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

        try {
          cid = new CID(split[0])
        } catch (err) {
          return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
        }

        split.shift()

        if (split.length > 0) {
          path = split.join('/')
        } else {
          path = undefined
        }
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      pull(
        iterToPull(self._ipld.tree(cid, path, options)),
        pull.collect(callback)
      )
    })
  }
}
