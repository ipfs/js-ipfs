'use strict'

const DAGNode = require('ipfs-merkle-dag').DAGNode
const DAGLink = require('ipfs-merkle-dag').DAGLink
const promisify = require('promisify-es6')
const bs58 = require('bs58')
const bl = require('bl')

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

      send('object/get', multihash, null, null, (err, result) => {
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

      send('object/put', null, {inputenc: enc}, buf, (err, result) => {
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

      send('object/data', multihash, null, null, (err, result) => {
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

      send('object/links', multihash, null, null, (err, result) => {
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
    stat: promisify((multihash, options, callback) => {
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

      send('object/stat', multihash, null, null, callback)
    }),
    new: promisify((callback) => {
      send('object/new', null, null, null, (err, result) => {
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
      addLink: promisify((multihash, dLink, options, callback) => {
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

        send('object/patch/add-link', [multihash, dLink.name, bs58.encode(dLink.hash).toString()], null, null, (err, result) => {
          if (err) {
            return callback(err)
          }
          api.get(result.Hash, { enc: 'base58' }, callback)
        })
      }),
      rmLink: promisify((multihash, dLink, options, callback) => {
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

        send('object/patch/rm-link', [multihash, dLink.name], null, null, (err, result) => {
          if (err) {
            return callback(err)
          }
          api.get(result.Hash, { enc: 'base58' }, callback)
        })
      }),
      setData: promisify((multihash, data, options, callback) => {
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

        send('object/patch/set-data', [multihash], null, data, (err, result) => {
          if (err) {
            return callback(err)
          }
          api.get(result.Hash, { enc: 'base58' }, callback)
        })
      }),
      appendData: promisify((multihash, data, options, callback) => {
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

        send('object/patch/append-data', [multihash], null, data, (err, result) => {
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

function cleanMultihash (multihash, options) {
  if (Buffer.isBuffer(multihash)) {
    if (options.enc) {
      switch (options.enc) {
        case 'base58': {
          multihash = multihash.toString()
          break
        }
        default: throw new Error('invalid multihash')
      }
    } else {
      multihash = bs58.encode(multihash).toString()
    }
  } else if (typeof multihash === 'string') {
    if (options.enc) {
      // For the future, when we support more than one enc
      // switch (options.enc) {
      //   case 'base58':  // It is good
      // }
    } else {
      throw new Error('not valid multihash')
    }
  } else if (!multihash) {
    throw new Error('missing valid multihash')
  }

  return multihash
}
