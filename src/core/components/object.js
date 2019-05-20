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
const multicodec = require('multicodec')
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

  try {
    callback(null, DAGNode.create(data, links))
  } catch (err) {
    callback(err)
  }
}

function parseProtoBuffer (buf, callback) {
  let obj
  try {
    obj = dagPB.util.deserialize(buf)
  } catch (err) {
    return callback(err)
  }
  callback(null, obj)
}

function findLinks (node, links = []) {
  for (const key in node) {
    const val = node[key]

    if (key === '/' && Object.keys(node).length === 1) {
      try {
        links.push(new DAGLink('', 0, new CID(val)))
        continue
      } catch (_) {
        // not a CID
      }
    }

    if (CID.isCID(val)) {
      links.push(new DAGLink('', 0, val))

      continue
    }

    if (Array.isArray(val)) {
      findLinks(val, links)
    }

    if (typeof val === 'object' && !(val instanceof String)) {
      findLinks(val, links)
    }
  }

  return links
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

            self._ipld.put(node, multicodec.DAG_PB, {
              cidVersion: 0,
              hashAlg: multicodec.SHA2_256
            }).then(
              (cid) => {
                if (options.preload !== false) {
                  self._preload(cid)
                }

                cb(null, cid)
              },
              (error) => cb(error)
            )
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

      let node

      try {
        node = DAGNode.create(data)
      } catch (err) {
        return callback(err)
      }

      self._ipld.put(node, multicodec.DAG_PB, {
        cidVersion: 0,
        hashAlg: multicodec.SHA2_256
      }).then(
        (cid) => {
          if (options.preload !== false) {
            self._preload(cid)
          }

          callback(null, cid)
        },
        (error) => callback(error)
      )
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
          try {
            node = DAGNode.create(obj)
          } catch (err) {
            return callback(err)
          }

          next()
        }
      } else if (DAGNode.isDAGNode(obj)) {
        // already a dag node
        node = obj
        next()
      } else if (typeof obj === 'object') {
        try {
          node = DAGNode.create(obj.Data, obj.Links)
        } catch (err) {
          return callback(err)
        }

        next()
      } else {
        return callback(new Error('obj not recognized'))
      }

      function next () {
        self._gcLock.readLock((cb) => {
          self._ipld.put(node, multicodec.DAG_PB, {
            cidVersion: 0,
            hashAlg: multicodec.SHA2_256
          }).then(
            (cid) => {
              if (options.preload !== false) {
                self._preload(cid)
              }

              cb(null, cid)
            },
            cb
          )
        }, callback)
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

      self._ipld.get(cid).then(
        (node) => callback(null, node),
        (error) => callback(error)
      )
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

        callback(null, node.Data)
      })
    }),

    links: promisify((multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      const cid = new CID(multihash)

      self.dag.get(cid, options, (err, result) => {
        if (err) {
          return callback(err)
        }

        if (cid.codec === 'raw') {
          return callback(null, [])
        }

        if (cid.codec === 'dag-pb') {
          return callback(null, result.value.Links)
        }

        if (cid.codec === 'dag-cbor') {
          const links = findLinks(result)

          return callback(null, links)
        }

        callback(new Error(`Cannot resolve links from codec ${cid.codec}`))
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
          cb(null, {
            node,
            serialized: dagPB.util.serialize(node)
          })
        },
        ({ node, serialized }, cb) => {
          parallel({
            serialized: (next) => next(null, serialized),
            cid: (next) => dagPB.util.cid(serialized, {
              cidVersion: 0
            }).then((cid) => next(null, cid), next),
            node: (next) => next(null, node)
          }, cb)
        }
      ], (err, result) => {
        if (err) {
          return callback(err)
        }

        const blockSize = result.serialized.length
        const linkLength = result.node.Links.reduce((a, l) => a + l.Tsize, 0)

        callback(null, {
          Hash: result.cid.toBaseEncodedString(),
          NumLinks: result.node.Links.length,
          BlockSize: blockSize,
          LinksSize: blockSize - result.node.Data.length,
          DataSize: result.node.Data.length,
          CumulativeSize: blockSize + linkLength
        })
      })
    }),

    patch: promisify({
      addLink (multihash, link, options, callback) {
        editAndSave((node, cb) => {
          DAGNode.addLink(node, link).then((node) => {
            cb(null, node)
          }, cb)
        })(multihash, options, callback)
      },

      rmLink (multihash, linkRef, options, callback) {
        editAndSave((node, cb) => {
          linkRef = linkRef.Name || linkRef.name

          try {
            node = DAGNode.rmLink(node, linkRef)
          } catch (err) {
            return cb(err)
          }

          cb(null, node)
        })(multihash, options, callback)
      },

      appendData (multihash, data, options, callback) {
        editAndSave((node, cb) => {
          const newData = Buffer.concat([node.Data, data])

          try {
            node = DAGNode.create(newData, node.Links)
          } catch (err) {
            return cb(err)
          }

          cb(null, node)
        })(multihash, options, callback)
      },

      setData (multihash, data, options, callback) {
        editAndSave((node, cb) => {
          try {
            node = DAGNode.create(data, node.Links)
          } catch (err) {
            return cb(err)
          }

          cb(null, node)
        })(multihash, options, callback)
      }
    })
  }
}
