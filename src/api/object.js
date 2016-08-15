'use strict'

const DAGNode = require('ipfs-merkle-dag').DAGNode
const DAGLink = require('ipfs-merkle-dag').DAGLink
const promisify = require('promisify-es6')
const bs58 = require('bs58')
const bl = require('bl')
const cleanMultihash = require('../clean-multihash')

module.exports = (send) => {
  const api = {
    get: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      try {
        multihash = cleanMultihash(multihash, options)
      } catch (err) {
        return callback(err)
      }

      send({
        path: 'object/get',
        args: multihash
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        const node = new DAGNode(result.Data, result.Links.map(
          (l) => {
            return new DAGLink(l.Name, l.Size, new Buffer(bs58.decode(l.Hash)))
          }))

        callback(null, node)
      })
    }),
    put: promisify((obj, options, callback) => {
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
          tmpObj = { Data: obj.toString(), Links: [] }
        }
      } else if (obj.multihash) {
        tmpObj = {
          Data: obj.data.toString(),
          Links: obj.links.map((l) => { return l.toJSON() })
        }
      } else if (typeof obj === 'object') {
        tmpObj.Data = obj.Data.toString()
      } else {
        return callback(new Error('obj not recognized'))
      }

      let buf
      if (Buffer.isBuffer(obj) && options.enc) {
        buf = obj
      } else {
        buf = new Buffer(JSON.stringify(tmpObj))
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
          node = new DAGNode()
          node.unMarshal(obj)
        } else {
          node = new DAGNode(obj.Data, obj.Links)
        }

        if (node.toJSON().Hash !== result.Hash) {
          return callback(new Error('Stored object was different from constructed object'))
        }

        callback(null, node)
      })
    }),
    data: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      try {
        multihash = cleanMultihash(multihash, options)
      } catch (err) {
        return callback(err)
      }

      send({
        path: 'object/data',
        args: multihash
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        if (typeof result.pipe === 'function') {
          result.pipe(bl(callback))
        } else {
          callback(null, result)
        }
      })
    }),
    links: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      if (!options) {
        options = {}
      }

      try {
        multihash = cleanMultihash(multihash, options)
      } catch (err) {
        return callback(err)
      }

      send({
        path: 'object/links',
        args: multihash
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        let links = []

        if (result.Links) {
          links = result.Links.map((l) => {
            return new DAGLink(l.Name, l.Size, new Buffer(bs58.decode(l.Hash)))
          })
        }
        callback(null, links)
      })
    }),
    stat: promisify((multihash, opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      if (!opts) {
        opts = {}
      }

      try {
        multihash = cleanMultihash(multihash, opts)
      } catch (err) {
        return callback(err)
      }

      send({
        path: 'object/stat',
        args: multihash
      }, callback)
    }),
    new: promisify((callback) => {
      send({
        path: 'object/new'
      }, (err, result) => {
        if (err) {
          return callback(err)
        }
        const node = new DAGNode()

        if (node.toJSON().Hash !== result.Hash) {
          return callback(new Error('Stored object was different from constructed object'))
        }

        callback(null, node)
      })
    }),
    patch: {
      addLink: promisify((multihash, dLink, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
          opts = {}
        }
        if (!opts) {
          opts = {}
        }

        try {
          multihash = cleanMultihash(multihash, opts)
        } catch (err) {
          return callback(err)
        }

        send({
          path: 'object/patch/add-link',
          args: [multihash, dLink.name, bs58.encode(dLink.hash).toString()]
        }, (err, result) => {
          if (err) {
            return callback(err)
          }
          api.get(result.Hash, { enc: 'base58' }, callback)
        })
      }),
      rmLink: promisify((multihash, dLink, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
          opts = {}
        }
        if (!opts) {
          opts = {}
        }

        try {
          multihash = cleanMultihash(multihash, opts)
        } catch (err) {
          return callback(err)
        }

        send({
          path: 'object/patch/rm-link',
          args: [multihash, dLink.name]
        }, (err, result) => {
          if (err) {
            return callback(err)
          }
          api.get(result.Hash, { enc: 'base58' }, callback)
        })
      }),
      setData: promisify((multihash, data, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
          opts = {}
        }
        if (!opts) {
          opts = {}
        }

        try {
          multihash = cleanMultihash(multihash, opts)
        } catch (err) {
          return callback(err)
        }

        send({
          path: 'object/patch/set-data',
          args: [multihash],
          files: data
        }, (err, result) => {
          if (err) {
            return callback(err)
          }
          api.get(result.Hash, { enc: 'base58' }, callback)
        })
      }),
      appendData: promisify((multihash, data, opts, callback) => {
        if (typeof opts === 'function') {
          callback = opts
          opts = {}
        }
        if (!opts) {
          opts = {}
        }

        try {
          multihash = cleanMultihash(multihash, opts)
        } catch (err) {
          return callback(err)
        }

        send({
          path: 'object/patch/append-data',
          args: [multihash],
          files: data
        }, (err, result) => {
          if (err) {
            return callback(err)
          }
          api.get(result.Hash, { enc: 'base58' }, callback)
        })
      })
    }
  }

  return api
}
