'use strict'

const waterfall = require('async/waterfall')
const parallel = require('async/parallel')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const CID = require('cids')
const mh = require('multihashes')
const Unixfs = require('ipfs-unixfs')
const errCode = require('err-code')

function normalizeMultihash (multihash, enc) {
  if (typeof multihash === 'string') {
    if (enc === 'base58' || !enc) {
      return multihash
    }

    return Buffer.from(multihash, enc)
  } else if (Buffer.isBuffer(multihash)) {
    return multihash
  } else if (CID.isCID(multihash)) {
    return multihash.buffer
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

      options = options || {}

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

            self._ipld.put(node, {
              version: 0,
              hashAlg: 'sha2-256',
              format: 'dag-pb'
            }, (err, cid) => {
              if (err) return cb(err)

              if (options.preload !== false) {
                self._preload(cid)
              }

              cb(null, cid)
            })
          })
        }
      ], callback)
    }
  }

  return {
    new: promisify((template, options, callback) => {
      if (typeof template === 'function') {
        callback = template
        template = undefined
        options = {}
      }

      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      let data

      if (template) {
        if (template !== 'unixfs-dir') {
          return setImmediate(() => callback(new Error('unknown template')))
        }
        data = (new Unixfs('directory')).marshal()
      } else {
        data = Buffer.alloc(0)
      }

      DAGNode.create(data, (err, node) => {
        if (err) {
          return callback(err)
        }

        self._ipld.put(node, {
          version: 0,
          hashAlg: 'sha2-256',
          format: 'dag-pb'
        }, (err, cid) => {
          if (err) {
            return callback(err)
          }

          if (options.preload !== false) {
            self._preload(cid)
          }

          callback(null, cid)
        })
      })
    }),
    put: promisify((obj, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

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
      } else if (DAGNode.isDAGNode(obj)) {
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
        self._ipld.put(node, {
          version: 0,
          hashAlg: 'sha2-256',
          format: 'dag-pb'
        }, (err, cid) => {
          if (err) {
            return callback(err)
          }

          if (options.preload !== false) {
            self._preload(cid)
          }

          callback(null, cid)
        })
      }
    }),

    get: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      let mh, cid

      try {
        mh = normalizeMultihash(multihash, options.enc)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_MULTIHASH')))
      }

      try {
        cid = new CID(mh)
      } catch (err) {
        return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
      }

      if (options.cidVersion === 1) {
        cid = cid.toV1()
      }

      if (options.preload !== false) {
        self._preload(cid)
      }

      self._ipld.get(cid, (err, result) => {
        if (err) {
          return callback(err)
        }

        callback(null, result.value)
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

      options = options || {}

      waterfall([
        (cb) => self.object.get(multihash, options, cb),
        (node, cb) => {
          parallel({
            serialized: (next) => dagPB.util.serialize(node, next),
            cid: (next) => dagPB.util.cid(node, next),
            node: (next) => next(null, node)
          }, cb)
        }
      ], (err, result) => {
        if (err) {
          return callback(err)
        }

        const blockSize = result.serialized.length
        const linkLength = result.node.links.reduce((a, l) => a + l.size, 0)

        callback(null, {
          Hash: result.cid.toBaseEncodedString(),
          NumLinks: result.node.links.length,
          BlockSize: blockSize,
          LinksSize: blockSize - result.node.data.length,
          DataSize: result.node.data.length,
          CumulativeSize: blockSize + linkLength
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
          if (DAGLink.isDAGLink(linkRef)) {
            linkRef = linkRef._name
          } else if (linkRef && linkRef.name) {
            linkRef = linkRef.name
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
