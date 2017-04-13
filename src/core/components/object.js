'use strict'

const waterfall = require('async/waterfall')
const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const CID = require('cids')
const mh = require('multihashes')
const Unixfs = require('ipfs-unixfs')
const assert = require('assert')

function normalizeMultihash (multihash, enc) {
  if (typeof multihash === 'string') {
    if (enc === 'base58' || !enc) {
      return multihash
    }

    return Buffer.from(multihash, enc)
  } else if (Buffer.isBuffer(multihash)) {
    return multihash
  } else {
    throw new Error('unsupported multihash')
  }
}

function parseBuffer (buf, encoding, callback) {
  switch (encoding) {
    case 'json':
      return parseJSONBuffer(buf, callback)
    case 'protobuf':
      return parseProtoBuffer(buf, callback)
    default:
      callback(new Error(`unkown encoding: ${encoding}`))
  }
}

function parseJSONBuffer (buf, callback) {
  let data
  let links

  try {
    const parsed = JSON.parse(buf.toString())

    links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        link.Name || link.name,
        link.Size || link.size,
        mh.fromB58String(link.Hash || link.hash || link.multihash)
      )
    })
    data = Buffer.from(parsed.Data)
  } catch (err) {
    return callback(new Error('failed to parse JSON: ' + err))
  }

  DAGNode.create(data, links, callback)
}

function parseProtoBuffer (buf, callback) {
  dagPB.util.deserialize(buf, callback)
}

module.exports = function object (self) {
  function editAndSave (edit) {
    return (multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      waterfall([
        (cb) => {
          self.object.get(multihash, options, cb)
        },
        (node, cb) => {
          // edit applies the edit func passed to
          // editAndSave
          edit(node, (err, node) => {
            if (err) {
              return cb(err)
            }
            self._ipldResolver.put(node, {
              cid: new CID(node.multihash)
            }, (err) => {
              cb(err, node)
            })
          })
        }
      ], callback)
    }
  }

  return {
    new: promisify((template, callback) => {
      if (typeof template === 'function') {
        callback = template
        template = undefined
      }

      let data

      if (template) {
        assert(template === 'unixfs-dir', 'unkown template')
        data = (new Unixfs('directory')).marshal()
      } else {
        data = Buffer.alloc(0)
      }

      DAGNode.create(data, (err, node) => {
        if (err) {
          return callback(err)
        }
        self._ipldResolver.put(node, {
          cid: new CID(node.multihash)
        }, (err) => {
          if (err) {
            return callback(err)
          }

          callback(null, node)
        })
      })
    }),
    put: promisify((obj, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      const encoding = options.enc
      let node

      if (Buffer.isBuffer(obj)) {
        if (encoding) {
          parseBuffer(obj, encoding, (err, _node) => {
            if (err) {
              return callback(err)
            }
            node = _node
            next()
          })
        } else {
          DAGNode.create(obj, (err, _node) => {
            if (err) {
              return callback(err)
            }
            node = _node
            next()
          })
        }
      } else if (obj.multihash) {
        // already a dag node
        node = obj
        next()
      } else if (typeof obj === 'object') {
        DAGNode.create(obj.Data, obj.Links, (err, _node) => {
          if (err) {
            return callback(err)
          }
          node = _node
          next()
        })
      } else {
        return callback(new Error('obj not recognized'))
      }

      function next () {
        self._ipldResolver.put(node, {
          cid: new CID(node.multihash)
        }, (err) => {
          if (err) {
            return callback(err)
          }

          self.object.get(node.multihash, callback)
        })
      }
    }),

    get: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      let mh

      try {
        mh = normalizeMultihash(multihash, options.enc)
      } catch (err) {
        return callback(err)
      }
      const cid = new CID(mh)

      self._ipldResolver.get(cid, (err, result) => {
        if (err) {
          return callback(err)
        }

        const node = result.value

        callback(null, node)
      })
    }),

    data: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      self.object.get(multihash, options, (err, node) => {
        if (err) {
          return callback(err)
        }
        callback(null, node.data)
      })
    }),

    links: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      self.object.get(multihash, options, (err, node) => {
        if (err) {
          return callback(err)
        }

        callback(null, node.links)
      })
    }),

    stat: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      self.object.get(multihash, options, (err, node) => {
        if (err) {
          return callback(err)
        }

        dagPB.util.serialize(node, (err, serialized) => {
          if (err) {
            return callback(err)
          }

          const blockSize = serialized.length
          const linkLength = node.links.reduce((a, l) => a + l.size, 0)

          const nodeJSON = node.toJSON()

          callback(null, {
            Hash: nodeJSON.multihash,
            NumLinks: node.links.length,
            BlockSize: blockSize,
            LinksSize: blockSize - node.data.length,
            DataSize: node.data.length,
            CumulativeSize: blockSize + linkLength
          })
        })
      })
    }),

    patch: promisify({
      addLink (multihash, link, options, callback) {
        editAndSave((node, cb) => {
          DAGNode.addLink(node, link, cb)
        })(multihash, options, callback)
      },

      rmLink (multihash, linkRef, options, callback) {
        editAndSave((node, cb) => {
          if (linkRef.constructor &&
              linkRef.constructor.name === 'DAGLink') {
            linkRef = linkRef._name
          }
          DAGNode.rmLink(node, linkRef, cb)
        })(multihash, options, callback)
      },

      appendData (multihash, data, options, callback) {
        editAndSave((node, cb) => {
          const newData = Buffer.concat([node.data, data])
          DAGNode.create(newData, node.links, cb)
        })(multihash, options, callback)
      },

      setData (multihash, data, options, callback) {
        editAndSave((node, cb) => {
          DAGNode.create(data, node.links, cb)
        })(multihash, options, callback)
      }
    })
  }
}
