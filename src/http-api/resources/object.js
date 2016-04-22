'use strict'

const bs58 = require('bs58')
const multipart = require('ipfs-multipart')
const mDAG = require('ipfs-merkle-dag')
const DAGLink = mDAG.DAGLink
const debug = require('debug')
const log = debug('http-api:object')
log.error = debug('http-api:object:error')
const DAGNode = mDAG.DAGNode

exports = module.exports

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, reply) => {
  if (!request.query.arg) {
    return reply("Argument 'key' is required").code(400).takeover()
  }

  try {
    return reply({
      key: new Buffer(bs58.decode(request.query.arg))
    })
  } catch (err) {
    log.error(err)
    return reply({
      Message: 'invalid ipfs ref path',
      Code: 0
    }).code(500).takeover()
  }
}

exports.new = {
  // pre request handler that parses the args and returns `template` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    // TODO improve this validation once request.server.app.ipfs.object.new supports templates
    if (request.query.arg === '') {
      return reply({
        Message: `template \'${request.query.arg}\' not found`,
        Code: 0
      }).code(500).takeover()
    }

    return reply({
      template: request.query.arg
    })
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const template = request.pre.args.template

    request.server.app.ipfs.object.new(template, (err, obj) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to create object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Hash: bs58.encode(obj.Hash).toString(),
        Links: obj.Links || null
      })
    })
  }
}

exports.get = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.object.get(key, (err, obj) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Links: obj.links.map((link) => ({
          Name: link.name,
          Hash: bs58.encode(link.hash).toString(),
          Size: link.size
        })),
        Data: obj.data.toString()
      })
    })
  }
}

exports.put = {
  // pre request handler that parses the args and returns `node` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!request.payload) {
      return reply("File argument 'data' is required").code(400).takeover()
    }

    const parser = multipart.reqParser(request.payload)
    var file

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
          node: JSON.parse(file.toString())
        })
      } catch (err) {
        return reply({
          Message: 'Failed to parse the JSON: ' + err,
          Code: 0
        }).code(500).takeover()
      }
    })
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const node = request.pre.args.node

    const data = new Buffer(node.Data)
    const links = node.Links.map((link) => ({
      name: link.Name,
      hash: new Buffer(bs58.decode(link.Hash)),
      size: link.Size
    }))

    const dagNode = new DAGNode(data, links)

    request.server.app.ipfs.object.put(dagNode, (err, obj) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to put object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Hash: bs58.encode(dagNode.multihash()).toString(),
        Links: dagNode.links.map((link) => ({
          Name: link.name,
          Hash: bs58.encode(link.hash).toString(),
          Size: link.size
        }))
      })
    })
  }
}

exports.stat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.object.stat(key, (err, stats) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Hash: bs58.encode(key).toString(),
        NumLinks: stats.NumLinks,
        BlockSize: stats.BlockSize,
        LinksSize: stats.LinksSize,
        DataSize: stats.DataSize
        // CumulativeSize: stats.CumulativeSize
      })
    })
  }
}

exports.data = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.object.data(key, (err, data) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply(data.toString())
    })
  }
}

exports.links = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.object.links(key, (err, links) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Hash: bs58.encode(key).toString(),
        Links: links.map((link) => ({
          Name: link.name,
          Hash: bs58.encode(link.hash).toString(),
          Size: link.size
        }))
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
        key: new Buffer(bs58.decode(request.query.arg)) // TODO: support ipfs paths: https://github.com/ipfs/http-api-spec/pull/68/files#diff-2625016b50d68d922257f74801cac29cR3880
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

    request.server.app.ipfs.object.patch.appendData(key, data, (err, obj) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to apend data to object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Hash: bs58.encode(obj.multihash()).toString(),
        Links: obj.links.map((link) => ({
          Name: link.name,
          Hash: bs58.encode(link.hash).toString(),
          Size: link.size
        }))
      })
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

    request.server.app.ipfs.object.patch.setData(key, data, (err, obj) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to apend data to object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Hash: bs58.encode(obj.multihash()).toString(),
        Links: obj.links.map((link) => ({
          Name: link.name,
          Hash: bs58.encode(link.hash).toString(),
          Size: link.size
        }))
      })
    })
  }
}

exports.patchAddLink = {
  // pre request handler that parses the args and returns `root`, `name` & `ref` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!(request.query.arg instanceof Array) || request.query.arg.length !== 3) {
      return reply("Arguments 'root', 'name' & 'ref' are required").code(400).takeover()
    }

    if (!request.query.arg[1]) {
      return reply({
        Message: 'cannot create link with no name!',
        Code: 0
      }).code(500).takeover()
    }

    try {
      return reply({
        root: new Buffer(bs58.decode(request.query.arg[0])),
        name: request.query.arg[1],
        ref: new Buffer(bs58.decode(request.query.arg[2]))
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
    const name = request.pre.args.name
    const ref = request.pre.args.ref

    request.server.app.ipfs.object.get(ref, (err, linkedObj) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get linked object: ' + err,
          Code: 0
        }).code(500)
      }

      const link = new DAGLink(name, linkedObj.size(), linkedObj.multihash())

      request.server.app.ipfs.object.patch.addLink(root, link, (err, obj) => {
        if (err) {
          log.error(err)

          return reply({
            Message: 'Failed to add link to object: ' + err,
            Code: 0
          }).code(500)
        }

        return reply({
          Hash: bs58.encode(obj.multihash()).toString(),
          Links: obj.links.map((link) => ({
            Name: link.name,
            Hash: bs58.encode(link.hash).toString(),
            Size: link.size
          }))
        })
      })
    })
  }
}

exports.patchRmLink = {
  // pre request handler that parses the args and returns `root` & `link` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!(request.query.arg instanceof Array) || request.query.arg.length !== 2) {
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
        root: new Buffer(bs58.decode(request.query.arg[0])),
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

    request.server.app.ipfs.object.patch.rmLink(root, link, (err, obj) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to add link to object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Hash: bs58.encode(obj.multihash()).toString(),
        Links: obj.links.map((link) => ({
          Name: link.name,
          Hash: bs58.encode(link.hash).toString(),
          Size: link.size
        }))
      })
    })
  }
}
