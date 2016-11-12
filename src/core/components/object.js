'use strict'

const waterfall = require('async/waterfall')
const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const CID = require('cids')
const mh = require('multihashes')

function normalizeMultihash (multihash, enc) {
  if (typeof multihash === 'string') {
    if (enc === 'base58') {
      return multihash
    }

    return new Buffer(multihash, enc)
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
  let node
  try {
    const parsed = JSON.parse(buf.toString())
    const links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        link.Name,
        link.Size,
        mh.fromB58String(link.Hash)
      )
    })
    node = new DAGNode(new Buffer(parsed.Data), links)
  } catch (err) {
    return callback(new Error('failed to parse JSON: ' + err))
  }
  callback(null, node)
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
          node = edit(node)

          node.multihash((err, multihash) => {
            if (err) {
              return cb(err)
            }
            self._ipldResolver.put({
              node: node,
              cid: new CID(multihash)
            }, (err) => {
              cb(err, node)
            })
          })
        }
      ], callback)
    }
  }

  return {
    new: promisify((callback) => {
      const node = new DAGNode()

      node.multihash((err, multihash) => {
        if (err) {
          return callback(err)
        }
        self._ipldResolver.put({
          node: node,
          cid: new CID(multihash)
        }, function (err) {
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
          return
        } else {
          node = new DAGNode(obj)
        }
      } else if (obj.multihash) {
        // already a dag node
        node = obj
      } else if (typeof obj === 'object') {
        node = new DAGNode(obj.Data, obj.Links)
      } else {
        return callback(new Error('obj not recognized'))
      }

      next()

      function next () {
        node.multihash((err, multihash) => {
          if (err) {
            return callback(err)
          }
          self._ipldResolver.put({
            node: node,
            cid: new CID(multihash)
          }, (err, block) => {
            if (err) {
              return callback(err)
            }

            self.object.get(multihash, callback)
          })
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
      self._ipldResolver.get(cid, callback)
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

          node.toJSON((err, nodeJSON) => {
            if (err) {
              return callback(err)
            }

            callback(null, {
              Hash: nodeJSON.Hash,
              NumLinks: node.links.length,
              BlockSize: blockSize,
              LinksSize: blockSize - node.data.length,
              DataSize: node.data.length,
              CumulativeSize: blockSize + linkLength
            })
          })
        })
      })
    }),

    patch: promisify({
      addLink (multihash, link, options, callback) {
        editAndSave((node) => {
          node.addRawLink(link)
          return node
        })(multihash, options, callback)
      },

      rmLink (multihash, linkRef, options, callback) {
        editAndSave((node) => {
          node.links = node.links.filter((link) => {
            if (typeof linkRef === 'string') {
              return link.name !== linkRef
            }

            if (Buffer.isBuffer(linkRef)) {
              return !link.hash.equals(linkRef)
            }

            if (linkRef.name) {
              return link.name !== linkRef.name
            }

            return !link.hash.equals(linkRef.hash)
          })
          return node
        })(multihash, options, callback)
      },

      appendData (multihash, data, options, callback) {
        editAndSave((node) => {
          node.data = Buffer.concat([node.data, data])
          return node
        })(multihash, options, callback)
      },

      setData (multihash, data, options, callback) {
        editAndSave((node) => {
          node.data = data
          return node
        })(multihash, options, callback)
      }
    })
  }
}
