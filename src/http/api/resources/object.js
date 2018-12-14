'use strict'

const CID = require('cids')
const multipart = require('ipfs-multipart')
const dagPB = require('ipld-dag-pb')
const DAGLink = dagPB.DAGLink
const DAGNode = dagPB.DAGNode
const waterfall = require('async/waterfall')
const Joi = require('joi')
const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
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
      key: new CID(request.query.arg)
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
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  handler (request, reply) {
    const ipfs = request.server.app.ipfs
    const template = request.query.arg

    waterfall([
      (cb) => ipfs.object.new(template, cb),
      (cid, cb) => ipfs.object.get(cid, (err, node) => cb(err, { node, cid }))
    ], (err, results) => {
      if (err) {
        log.error(err)
        return reply({
          Message: `Failed to create object: ${err.message}`,
          Code: 0
        }).code(500)
      }

      const nodeJSON = results.node.toJSON()

      const answer = {
        Data: nodeJSON.data,
        Hash: cidToString(results.cid, { base: request.query['cid-base'], upgrade: false }),
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
          }
        })
      }

      return reply(answer)
    })
  }
}

exports.get = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const enc = request.query.enc || 'base58'
    const ipfs = request.server.app.ipfs

    waterfall([
      (cb) => ipfs.object.get(key, { enc: enc }, cb),
      (node, cb) => dagPB.util.cid(node, (err, cid) => cb(err, { node, cid }))
    ], (err, results) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = results.node.toJSON()

      if (Buffer.isBuffer(results.node.data)) {
        nodeJSON.data = results.node.data.toString(request.query['data-encoding'] || undefined)
      }

      const answer = {
        Data: nodeJSON.data,
        Hash: cidToString(results.cid, { base: request.query['cid-base'], upgrade: false }),
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
          }
        })
      }

      return reply(answer)
    })
  }
}

exports.put = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

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
          waterfall([
            (cb) => dagPB.util.deserialize(data, cb),
            (node, cb) => dagPB.util.cid(node, (err, cid) => cb(err, { node, cid }))
          ], (err, results) => {
            if (err) {
              return reply({
                Message: 'Failed to put object: ' + err,
                Code: 0
              }).code(500).takeover()
            }

            const nodeJSON = results.node.toJSON()

            const answer = {
              Data: nodeJSON.data,
              Hash: results.cid.toBaseEncodedString(),
              Size: nodeJSON.size,
              Links: nodeJSON.links.map((l) => {
                return {
                  Name: l.name,
                  Size: l.size,
                  Hash: l.cid
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

    waterfall([
      (cb) => DAGNode.create(Buffer.from(node.Data), node.Links, cb),
      (node, cb) => ipfs.object.put(node, (err, cid) => cb(err, { cid, node }))
    ], (err, results) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to put object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = results.node.toJSON()

      const answer = {
        Data: nodeJSON.data,
        Hash: cidToString(results.cid, { base: request.query['cid-base'], upgrade: false }),
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
          }
        })
      }

      return reply(answer)
    })
  }
}

exports.stat = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

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
          Message: 'Failed to stat object: ' + err,
          Code: 0
        }).code(500)
      }

      stats.Hash = cidToString(stats.Hash, { base: request.query['cid-base'], upgrade: false })

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
          Message: 'Failed to get object data: ' + err,
          Code: 0
        }).code(500)
      }

      return reply(data)
    })
  }
}

exports.links = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

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
          Message: 'Failed to get object links: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = node.toJSON()

      return reply({
        Hash: cidToString(key, { base: request.query['cid-base'], upgrade: false }),
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
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
        key: new CID(request.query.arg)
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
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  // uses common parseKeyAndData method that returns a `data` & `key`
  parseArgs: exports.parseKeyAndData,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const data = request.pre.args.data
    const ipfs = request.server.app.ipfs

    waterfall([
      (cb) => ipfs.object.patch.appendData(key, data, cb),
      (cid, cb) => ipfs.object.get(cid, (err, node) => cb(err, { node, cid }))
    ], (err, results) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to append data to object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = results.node.toJSON()

      const answer = {
        Data: nodeJSON.data,
        Hash: cidToString(results.cid, { base: request.query['cid-base'], upgrade: false }),
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
          }
        })
      }

      return reply(answer)
    })
  }
}

exports.patchSetData = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  // uses common parseKeyAndData method that returns a `data` & `key`
  parseArgs: exports.parseKeyAndData,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const data = request.pre.args.data
    const ipfs = request.server.app.ipfs

    waterfall([
      (cb) => ipfs.object.patch.setData(key, data, cb),
      (cid, cb) => ipfs.object.get(cid, (err, node) => cb(err, { node, cid }))
    ], (err, results) => {
      if (err) {
        log.error(err)

        return reply({
          Message: 'Failed to set data on object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = results.node.toJSON()

      return reply({
        Hash: cidToString(results.cid, { base: request.query['cid-base'], upgrade: false }),
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
          }
        })
      })
    })
  }
}

exports.patchAddLink = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

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
        root: new CID(request.query.arg[0]),
        name: request.query.arg[1],
        ref: new CID(request.query.arg[2])
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

    waterfall([
      (cb) => ipfs.object.get(ref, cb),
      (node, cb) => ipfs.object.patch.addLink(root, new DAGLink(name, node.size, ref), cb),
      (cid, cb) => ipfs.object.get(cid, (err, node) => cb(err, { node, cid }))
    ], (err, results) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to add link to object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = results.node.toJSON()

      const answer = {
        Data: nodeJSON.data,
        Hash: cidToString(results.cid, { base: request.query['cid-base'], upgrade: false }),
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
          }
        })
      }

      return reply(answer)
    })
  }
}

exports.patchRmLink = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  // pre request handler that parses the args and returns `root` & `link` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!(request.query.arg instanceof Array) ||
        request.query.arg.length !== 2) {
      return reply("Arguments 'root' & 'link' are required").code(400).takeover()
    }

    if (!request.query.arg[1]) {
      return reply({
        Message: 'cannot remove link with no name!',
        Code: 0
      }).code(500).takeover()
    }

    try {
      return reply({
        root: new CID(request.query.arg[0]),
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

    waterfall([
      (cb) => ipfs.object.patch.rmLink(root, { name: link }, cb),
      (cid, cb) => ipfs.object.get(cid, (err, node) => cb(err, { node, cid }))
    ], (err, results) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to remove link from object: ' + err,
          Code: 0
        }).code(500)
      }

      const nodeJSON = results.node.toJSON()

      const answer = {
        Data: nodeJSON.data,
        Hash: cidToString(results.cid, { base: request.query['cid-base'], upgrade: false }),
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: request.query['cid-base'], upgrade: false })
          }
        })
      }

      return reply(answer)
    })
  }
}
