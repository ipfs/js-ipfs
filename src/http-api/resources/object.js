'use strict'

const mh = require('multihashes')
const multipart = require('ipfs-multipart')
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const DAGNode = dagPB.DAGNode
const waterfall = require('async/waterfall')
const series = require('async/series')
const debug = require('debug')
const log = debug('jsipfs:http-api:object')
log.error = debug('jsipfs:http-api:object:error')

exports = module.exports

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, reply) => {
  if (!request.query.arg) {
    return reply("Argument 'key' is required").code(400).takeover()
  }

  try {
    return reply({
      key: mh.fromB58String(request.query.arg)
    })
  } catch (err) {
    log.error(err)
    return reply({
      Message: 'invalid ipfs ref path',
      Code: 0
    }).code(500).takeover()
  }
}

exports.new = (request, reply) => {
  const ipfs = request.server.app.ipfs
  const template = request.query.arg

  ipfs.object.new(template, (err, node) => {
    if (err) {
      log.error(err)
      return reply({
        Message: `Failed to create object: ${err.message}`,
        Code: 0
      }).code(500)
    }

    const nodeJSON = node.toJSON()

    const answer = {
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

    return reply(answer)
  })
}

exports.get = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const enc = request.query.enc || 'base58'
    const ipfs = request.server.app.ipfs

    ipfs.object.get(key, { enc: enc }, (err, node) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = node.toJSON()

      nodeJSON.data = nodeJSON.data ? nodeJSON.data.toString() : ''

      const answer = {
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

      return reply(answer)
    })
  }
}

exports.put = {
  // pre request handler that parses the args and returns `node`
  // which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!request.payload) {
      return reply("File argument 'data' is required").code(400).takeover()
    }

    const enc = request.query.inputenc
    const parser = multipart.reqParser(request.payload)

    let file
    let finished = true

    // TODO: this whole function this to be revisited
    // so messy
    parser.on('file', (name, stream) => {
      finished = false
      // TODO fix: stream is not emitting the 'end' event
      stream.on('data', (data) => {
        if (enc === 'protobuf') {
          dagPB.util.deserialize(data, (err, node) => {
            if (err) {
              return reply({
                Message: 'Failed to receive protobuf encoded: ' + err,
                Code: 0
              }).code(500).takeover()
            }

            const nodeJSON = node.toJSON()

            const answer = {
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

            file = Buffer.from(JSON.stringify(answer))
            finished = true
          })
        } else {
          file = data

          finished = true
        }
      })
    })

    parser.on('end', finish)

    function finish () {
      if (!finished) {
        return setTimeout(finish, 10)
      }
      if (!file) {
        return reply("File argument 'data' is required").code(400).takeover()
      }

      try {
        return reply({
          node: JSON.parse(file.toString())
        })
      } catch (err) {
        return reply({
          Message: 'Failed to parse the JSON: ' + err,
          Code: 0
        }).code(500).takeover()
      }
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    let node = request.pre.args.node

    series([
      (cb) => {
        DAGNode.create(Buffer.from(node.Data), node.Links, (err, _node) => {
          if (err) {
            return cb(err)
          }
          node = _node
          cb()
        })
      },
      (cb) => ipfs.object.put(node, cb)
    ], (err) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to put object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = node.toJSON()

      const answer = {
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

      return reply(answer)
    })
  }
}

exports.stat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const key = request.pre.args.key

    ipfs.object.stat(key, (err, stats) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply(stats)
    })
  }
}

exports.data = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const key = request.pre.args.key

    ipfs.object.data(key, (err, data) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply(data)
    })
  }
}

exports.links = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const ipfs = request.server.app.ipfs

    ipfs.object.get(key, (err, node) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = node.toJSON()

      return reply({
        Hash: nodeJSON.multihash,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: l.multihash
          }
        })
      })
    })
  }
}

// common pre request handler that parses the args and returns `data` & `key` which are assigned to `request.pre.args`
exports.parseKeyAndData = (request, reply) => {
  if (!request.query.arg) {
    return reply("Argument 'root' is required").code(400).takeover()
  }

  if (!request.payload) {
    return reply("File argument 'data' is required").code(400).takeover()
  }

  const parser = multipart.reqParser(request.payload)
  let file

  parser.on('file', (fileName, fileStream) => {
    fileStream.on('data', (data) => {
      file = data
    })
  })

  parser.on('end', () => {
    if (!file) {
      return reply("File argument 'data' is required").code(400).takeover()
    }

    try {
      return reply({
        data: file,
        // TODO: support ipfs paths: https://github.com/ipfs/http-api-spec/pull/68/files#diff-2625016b50d68d922257f74801cac29cR3880
        key: mh.fromB58String(request.query.arg)
      })
    } catch (err) {
      return reply({
        Message: 'invalid ipfs ref path',
        Code: 0
      }).code(500).takeover()
    }
  })
}

exports.patchAppendData = {
  // uses common parseKeyAndData method that returns a `data` & `key`
  parseArgs: exports.parseKeyAndData,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const data = request.pre.args.data
    const ipfs = request.server.app.ipfs

    ipfs.object.patch.appendData(key, data, (err, node) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to apend data to object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = node.toJSON()

      const answer = {
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

      return reply(answer)
    })
  }
}

exports.patchSetData = {
  // uses common parseKeyAndData method that returns a `data` & `key`
  parseArgs: exports.parseKeyAndData,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const data = request.pre.args.data
    const ipfs = request.server.app.ipfs

    ipfs.object.patch.setData(key, data, (err, node) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to apend data to object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = node.toJSON()

      return reply({
        Hash: nodeJSON.multihash,
        Links: nodeJSON.links
      })
    })
  }
}

exports.patchAddLink = {
  // pre request handler that parses the args and returns `root`, `name` & `ref` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!(request.query.arg instanceof Array) ||
        request.query.arg.length !== 3) {
      return reply("Arguments 'root', 'name' & 'ref' are required").code(400).takeover()
    }

    const error = (msg) => reply({
      Message: msg,
      Code: 0
    }).code(500).takeover()

    if (!request.query.arg[0]) {
      return error('cannot create link with no root')
    }

    if (!request.query.arg[1]) {
      return error('cannot create link with no name!')
    }

    if (!request.query.arg[2]) {
      return error('cannot create link with no ref')
    }

    try {
      return reply({
        root: mh.fromB58String(request.query.arg[0]),
        name: request.query.arg[1],
        ref: mh.fromB58String(request.query.arg[2])
      })
    } catch (err) {
      log.error(err)
      return error('invalid ipfs ref path')
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const root = request.pre.args.root
    const name = request.pre.args.name
    const ref = request.pre.args.ref
    const ipfs = request.server.app.ipfs

    ipfs.object.get(ref, (err, linkedObj) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get linked object: ' + err,
          Code: 0
        }).code(500)
      }

      waterfall([
        (cb) => {
          const link = new DAGLink(
            name,
            linkedObj.size,
            linkedObj.multihash)
          cb(null, link)
        },
        (link, cb) => ipfs.object.patch.addLink(root, link, cb)
      ], (err, node) => {
        if (err) {
          log.error(err)
          return reply({
            Message: 'Failed to get linked object: ' + err,
            Code: 0
          }).code(500)
        }

        const nodeJSON = node.toJSON()

        const answer = {
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

        return reply(answer)
      })
    })
  }
}

exports.patchRmLink = {
  // pre request handler that parses the args and returns `root` & `link` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!(request.query.arg instanceof Array) ||
        request.query.arg.length !== 2) {
      return reply("Arguments 'root' & 'link' are required").code(400).takeover()
    }

    if (!request.query.arg[1]) {
      return reply({
        Message: 'cannot create link with no name!',
        Code: 0
      }).code(500).takeover()
    }

    try {
      return reply({
        root: mh.fromB58String(request.query.arg[0]),
        link: request.query.arg[1]
      })
    } catch (err) {
      log.error(err)
      return reply({
        Message: 'invalid ipfs ref path',
        Code: 0
      }).code(500).takeover()
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const root = request.pre.args.root
    const link = request.pre.args.link
    const ipfs = request.server.app.ipfs

    ipfs.object.patch.rmLink(root, link, (err, node) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to add link to object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = node.toJSON()

      const answer = {
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

      return reply(answer)
    })
  }
}
