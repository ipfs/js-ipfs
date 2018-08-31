'use strict'

const waterfall = require('async/waterfall')
const setImmediate = require('async/setImmediate')
const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const CID = require('cids')
const mh = require('multihashes')
const Unixfs = require('ipfs-unixfs')
const errCode = require('err-code')

const {
  readFileFromPathOrStdin,
  readFileFromRequestPayload
} = require('./api-shared')

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

            const cid = new CID(node.multihash)

            self._ipld.put(node, { cid }, (err) => {
              if (err) return cb(err)

              if (options.preload !== false) {
                self._preload(cid)
              }

              cb(null, node)
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

        const cid = new CID(node.multihash)

        self._ipld.put(node, { cid }, (err) => {
          if (err) {
            return callback(err)
          }

          if (options.preload !== false) {
            self._preload(cid)
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
        let cid

        try {
          cid = new CID(node.multihash)
        } catch (err) {
          return setImmediate(() => callback(errCode(err, 'ERR_INVALID_CID')))
        }

        self._ipld.put(node, { cid }, (err) => {
          if (err) {
            return callback(err)
          }

          if (options.preload !== false) {
            self._preload(cid)
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

const parseKey = (request, reply) => {
  if (!request.query.arg) {
    return reply("Argument 'key' is required").code(400).takeover()
  }

  try {
    return reply({
      key: mh.fromB58String(request.query.arg)
    })
  } catch (err) {
    return reply({
      Message: 'invalid ipfs ref path',
      Code: 0
    }).code(500).takeover()
  }
}

module.exports.__api = {
  name: 'object',
  cli: 'object <command>',
  description: 'Interact with ipfs objects',
  children: [
    {
      name: 'new',
      description: 'Create new ipfs objects',
      args: ['template'],
      preload: false,
      call: (self, template, options, callback) => {
        return self.object.new(template, (err, node) => {
          callback(err, node.toJSON())
        })
      },
      cli: {
        command: 'new [template]',
        post: (nodeJSON, printer) => {
          printer(nodeJSON.multihash)
        }
      },
      http: {
        post: (nodeJSON) => {
          return {
            Data: nodeJSON.data,
            Hash: nodeJSON.multihash,
            Size: nodeJSON.size,
            Links: nodeJSON.links.map((l) => {
              return {
                Name: l.name,
                Size: l.size,
                Hash: l.multihash
              }
            })
          }
        }
      }
    },
    {
      name: 'get',
      description: 'Get and serialize the DAG node named by <key>',
      args: ['key'],
      preload: false,
      call: (self, key, options, callback) => {
        return self.object.get(key, {enc: 'base58'}, (err, node) => {
          if (err) {
            return callback(err)
          }
          const nodeJSON = node.toJSON()
          if (Buffer.isBuffer(node.data)) {
            nodeJSON.data = node.data.toString(options['data-encoding'])
          }
          callback(null, nodeJSON)
        })
      },
      cli: {
        command: 'get <key>',
        builder: {
          'data-encoding': {
            type: 'string',
            default: 'base64'
          }
        },
        post: (nodeJSON, printer) => {
          printer(JSON.stringify({
            Data: nodeJSON.data,
            Hash: nodeJSON.multihash,
            Size: nodeJSON.size,
            Links: nodeJSON.links.map((l) => {
              return {
                Name: l.name,
                Size: l.size,
                Hash: l.multihash
              }
            })
          }))
        }
      },
      http: {
        pre: parseKey,
        post: (nodeJSON) => {
          return {
            Data: nodeJSON.data,
            Hash: nodeJSON.multihash,
            Size: nodeJSON.size,
            Links: nodeJSON.links.map((l) => {
              return {
                Name: l.name,
                Size: l.size,
                Hash: l.multihash
              }
            })
          }
        }
      }
    },
    {
      name: 'put',
      description: 'Stores input as a DAG object, outputs its key',
      args: ['data'],
      payload: {
        parse: false,
        output: 'stream'
      },
      call: (self, data, options, callback) => {
        const opts = {
          enc: options['input-enc']
        }
        self.object.put(data, opts, (err, node) => {
          callback(err, node.toJSON())
        })
      },
      cli: {
        command: 'put [data]',
        pre: readFileFromPathOrStdin('data'),
        post: (nodeJSON, printer) => {
          printer(`added ${nodeJSON.multihash}`)
        },
        builder: {
          'input-enc': {
            type: 'string',
            default: 'json'
          }
        }
      },
      http: {
        pre: readFileFromRequestPayload,
        call: (self, data, options, callback) => {
          console.log('data', data)
          console.log('options', options)
          callback(null, {lol: null})
        },
        post: (nodeJSON) => {
          return {
            Data: nodeJSON.data,
            Hash: nodeJSON.multihash,
            Size: nodeJSON.size,
            Links: nodeJSON.links.map((l) => {
              return {
                Name: l.name,
                Size: l.size,
                Hash: l.multihash
              }
            })
          }
        }
      }
    },
    {
      name: 'stat',
      description: 'Get stats for the DAG node named by <key>',
      args: ['key'],
      call: (self, key, options, callback) => {
        return self.object.stat(key, callback)
      },
      cli: {
        command: 'stat <key>',
        post: (stats, printer) => {
          delete stats.Hash
          Object.keys(stats).forEach((key) => {
            printer(`${key}: ${stats[key]}`)
          })
        }
      }
    },
    {
      name: 'data',
      description: 'Outputs the raw bytes in an IPFS object',
      args: ['key'],
      call: (self, key, options, callback) => {
        return self.object.data(key, callback)
      },
      cli: {
        command: 'data <key>',
        post: (data, printer) => {
          printer(data, false)
        }
      }
    },
    {
      name: 'links',
      description: 'Outputs the links pointed to by the specified object',
      args: ['key'],
      call: (self, key, options, callback) => {
        return self.object.links(key, {enc: 'base58'}, callback)
      },
      cli: {
        command: 'links <key>',
        post: (links, printer) => {
          links.forEach((link) => {
            link = link.toJSON()

            printer(`${link.multihash} ${link.size} ${link.name}`)
          })
        }
      }
    },
    {
      name: 'patch',
      children: [{
        name: 'append-data',
        description: 'Append data to the data segment of a dag node',
        args: ['root', 'data'],
        payload: {
          parse: false,
          output: 'stream'
        },
        call: (self, root, data, options, callback) => {
          self.object.patch.appendData(root, data, {
            enc: 'base58'
          }, (err, node) => {
            callback(err, node.toJSON())
          })
        },
        cli: {
          command: 'append-data <root> [data]',
          pre: readFileFromPathOrStdin('data'),
          post: (nodeJSON, print) => {
            print(nodeJSON.multihash)
          }
        }
      }, {
        name: 'set-data',
        description: 'Set data field of an ipfs object',
        args: ['root', 'data'],
        payload: {
          parse: false,
          output: 'stream'
        },
        call: (self, root, data, options, callback) => {
          self.object.patch.setData(root, data, {
            enc: 'base58'
          }, (err, node) => {
            callback(err, node.toJSON())
          })
        },
        cli: {
          command: 'set-data <root> [data]',
          pre: readFileFromPathOrStdin('data'),
          post: (nodeJSON, print) => {
            print(nodeJSON.multihash)
          }
        }
      }, {
        name: 'add-link',
        description: 'Add a link to a given object',
        args: ['root', 'name', 'ref'],
        call: (self, root, name, ref, options, callback) => {
          self.object.get(ref, {enc: 'base58'}, (err, nodeA) => {
            if (err) return callback(err)
            const link = new DAGLink(name, nodeA.size, nodeA.multihash)
            self.object.patch.addLink(root, link, {enc: 'base58'}, (err, node) => {
              callback(err, node.toJSON())
            })
          })
        },
        cli: {
          command: 'add-link <root> <name> <ref>',
          post: (nodeJSON, print) => {
            print(nodeJSON.multihash)
          }
        }
      }, {
        name: 'rm-link',
        description: 'Remove a link from an object',
        args: ['root', 'link'],
        call: (self, root, link, options, callback) => {
          self.object.patch.rmLink(root, {name: link}, {enc: 'base58'}, (err, node) => {
            callback(err, node.toJSON())
          })
        },
        cli: {
          command: 'rm-link <root> <link>',
          post: (nodeJSON, print) => {
            print(nodeJSON.multihash)
          }
        }
      }]
    }
  ]
}
