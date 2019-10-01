'use strict'

const callbackify = require('callbackify')
const CID = require('cids')
const all = require('async-iterator-all')
const errCode = require('err-code')
const multicodec = require('multicodec')

module.exports = function dag (self) {
  return {
    put: callbackify.variadic(async (dagNode, options) => {
      options = options || {}

      if (options.cid && (options.format || options.hashAlg)) {
        throw new Error('Can\'t put dag node. Please provide either `cid` OR `format` and `hashAlg` options.')
      } else if (((options.format && !options.hashAlg) || (!options.format && options.hashAlg))) {
        throw new Error('Can\'t put dag node. Please provide `format` AND `hashAlg` options.')
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

      const cid = await self._ipld.put(dagNode, options.format, {
        hashAlg: options.hashAlg,
        cidVersion: options.version
      })

      if (options.preload !== false) {
        self._preload(cid)
      }

      return cid
    }),

    get: callbackify.variadic(async (cid, path, options) => {
      options = options || {}

      // Allow options in path position
      if (path !== undefined && typeof path !== 'string') {
        options = path
        path = undefined
      }

      if (typeof cid === 'string') {
        const split = cid.split('/')

        try {
          cid = new CID(split[0])
        } catch (err) {
          throw errCode(err, 'ERR_INVALID_CID')
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
          throw errCode(err, 'ERR_INVALID_CID')
        }
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      if (path == null || path === '/') {
        const value = await self._ipld.get(cid)

        return {
          value,
          remainderPath: ''
        }
      } else {
        let result

        for await (const entry of self._ipld.resolve(cid, path)) {
          if (options.localResolve) {
            return entry
          }

          result = entry
        }

        return result
      }
    }),

    tree: callbackify.variadic(async (cid, path, options) => { // eslint-disable-line require-await
      options = options || {}

      // Allow options in path position
      if (path !== undefined && typeof path !== 'string') {
        options = path
        path = undefined
      }

      if (typeof cid === 'string') {
        const split = cid.split('/')

        try {
          cid = new CID(split[0])
        } catch (err) {
          throw errCode(err, 'ERR_INVALID_CID')
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

      return all(self._ipld.tree(cid, path, options))
    })
  }
}
