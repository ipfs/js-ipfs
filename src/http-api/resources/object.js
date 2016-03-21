'use strict'

const ipfs = require('./../index.js').ipfs
const bs58 = require('bs58')
const multipart = require('ipfs-multipart')
const mDAG = require('ipfs-merkle-dag')
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
    // TODO improve this validation once ipfs.object.new supports templates
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

    ipfs.object.new(template, (err, obj) => {
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

    ipfs.object.get(key, (err, obj) => {
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

    ipfs.object.put(dagNode, (err, obj) => {
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

    ipfs.object.stat(key, (err, stats) => {
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

    ipfs.object.data(key, (err, data) => {
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

    ipfs.object.links(key, (err, links) => {
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
