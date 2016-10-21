'use strict'

const mDAG = require('ipfs-merkle-dag')
const waterfall = require('async/waterfall')
const promisify = require('promisify-es6')
const bs58 = require('bs58')
const DAGNode = mDAG.DAGNode
const DAGLink = mDAG.DAGLink

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

function parseBuffer (buf, encoding) {
  switch (encoding) {
    case 'json':
      return parseJSONBuffer(buf)
    case 'protobuf':
      return parseProtoBuffer(buf)
    default:
      throw new Error(`unkown encoding: ${encoding}`)
  }
}

function parseJSONBuffer (buf) {
  try {
    const parsed = JSON.parse(buf.toString())
    const links = (parsed.Links || []).map((link) => {
      return new DAGLink(
        link.Name,
        link.Size,
        new Buffer(bs58.decode(link.Hash))
      )
    })
    return new DAGNode(new Buffer(parsed.Data), links)
  } catch (err) {
    throw new Error('failed to parse JSON: ' + err)
  }
}

function parseProtoBuffer (buf) {
  const node = new DAGNode()
  node.unMarshal(buf)
  return node
}

module.exports = function object (self) {
  function editAndSave (edit) {
    return (multihash, options, cb) => {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }

      waterfall([
        (cb) => self.object.get(multihash, options, cb),
        (node, cb) => {
          self._dagService.put(edit(node), (err) => {
            cb(err, node)
          })
        }
      ], cb)
    }
  }

  return {
    new: promisify((cb) => {
      const node = new DAGNode()

      self._dagService.put(node, function (err) {
        if (err) {
          return cb(err)
        }

        cb(null, node)
      })
    }),

    put: promisify((obj, options, cb) => {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }

      const encoding = options.enc
      let node

      if (Buffer.isBuffer(obj)) {
        if (encoding) {
          try {
            node = parseBuffer(obj, encoding)
          } catch (err) {
            return cb(err)
          }
        } else {
          node = new DAGNode(obj)
        }
      } else if (obj.multihash) {
        // already a dag node
        node = obj
      } else if (typeof obj === 'object') {
        node = new DAGNode(obj.Data, obj.Links)
      } else {
        return cb(new Error('obj not recognized'))
      }

      self._dagService.put(node, (err, block) => {
        if (err) {
          return cb(err)
        }

        self.object.get(node.multihash(), cb)
      })
    }),

    get: promisify((multihash, options, cb) => {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }

      let mh

      try {
        mh = normalizeMultihash(multihash, options.enc)
      } catch (err) {
        return cb(err)
      }

      self._dagService.get(mh, cb)
    }),

    data: promisify((multihash, options, cb) => {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }

      self.object.get(multihash, options, (err, node) => {
        if (err) {
          return cb(err)
        }
        cb(null, node.data)
      })
    }),

    links: promisify((multihash, options, cb) => {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }

      self.object.get(multihash, options, (err, node) => {
        if (err) {
          return cb(err)
        }

        cb(null, node.links)
      })
    }),

    stat: promisify((multihash, options, cb) => {
      if (typeof options === 'function') {
        cb = options
        options = {}
      }

      self.object.get(multihash, options, (err, node) => {
        if (err) {
          return cb(err)
        }

        const blockSize = node.marshal().length
        const linkLength = node.links.reduce((a, l) => a + l.size, 0)

        cb(null, {
          Hash: node.toJSON().Hash,
          NumLinks: node.links.length,
          BlockSize: blockSize,
          LinksSize: blockSize - node.data.length,
          DataSize: node.data.length,
          CumulativeSize: blockSize + linkLength
        })
      })
    }),

    patch: promisify({
      addLink (multihash, link, options, cb) {
        editAndSave((node) => {
          node.addRawLink(link)
          return node
        })(multihash, options, cb)
      },

      rmLink (multihash, linkRef, options, cb) {
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
        })(multihash, options, cb)
      },

      appendData (multihash, data, options, cb) {
        editAndSave((node) => {
          node.data = Buffer.concat([node.data, data])
          return node
        })(multihash, options, cb)
      },

      setData (multihash, data, options, cb) {
        editAndSave((node) => {
          node.data = data
          return node
        })(multihash, options, cb)
      }
    })
  }
}
