'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const promisify = require('promisify-es6')
const bs58 = require('bs58')
const streamToValue = require('../stream-to-value')
const cleanMultihash = require('../clean-multihash')
const LRU = require('lru-cache')
const lruOptions = {
  max: 128
}
const Unixfs = require('ipfs-unixfs')
const cache = LRU(lruOptions)

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

      const node = cache.get(multihash)

      if (node) {
        return callback(null, node)
      }

      send({
        path: 'object/get',
        args: multihash
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        const links = result.Links.map((l) => {
          return new DAGLink(l.Name, l.Size, new Buffer(bs58.decode(l.Hash)))
        })

        DAGNode.create(result.Data, links, (err, node) => {
          if (err) {
            return callback(err)
          }
          cache.set(multihash, node)
          callback(null, node)
        })
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
          dagPB.util.deserialize(obj, (err, _node) => {
            if (err) {
              return callback(err)
            }
            node = _node
            next()
          })
          return
        } else {
          DAGNode.create(new Buffer(obj.Data), obj.Links, (err, _node) => {
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

      const node = cache.get(multihash)

      if (node) {
        return callback(null, node.data)
      }

      send({
        path: 'object/data',
        args: multihash
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        if (typeof result.pipe === 'function') {
          streamToValue(result, callback)
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

      const node = cache.get(multihash)

      if (node) {
        return callback(null, node.links)
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
    new: promisify((template, callback) => {
      if (typeof template === 'function') {
        callback = template
        template = undefined
      }
      send({
        path: 'object/new',
        args: template
      }, (err, result) => {
        if (err) {
          return callback(err)
        }

        let data

        if (template) {
          if (template !== 'unixfs-dir') {
            return callback(new Error('unkown template: ' + template))
          }
          data = (new Unixfs('directory')).marshal()
        } else {
          data = new Buffer(0)
        }

        DAGNode.create(data, (err, node) => {
          if (err) {
            return callback(err)
          }

          if (node.toJSON().multihash !== result.Hash) {
            console.log(node.toJSON())
            console.log(result)
            return callback(new Error('multihashes do not match'))
          }

          callback(null, node)
        })
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
          args: [
            multihash,
            dLink.name,
            bs58.encode(dLink.multihash).toString()
          ]
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
          args: [
            multihash,
            dLink.name
          ]
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
