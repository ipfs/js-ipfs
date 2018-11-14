'use strict'

const CID = require('cids')
const multipart = require('ipfs-multipart')
const debug = require('debug')
const log = debug('jsipfs:http-api:block')
log.error = debug('jsipfs:http-api:block:error')

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
      Message: 'Not a valid hash',
      Code: 0
    }).code(500).takeover()
  }
}

exports.get = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.block.get(key, (err, block) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get block: ' + err,
          Code: 0
        }).code(500)
      }

      if (block) {
        return reply(block.data).header('X-Stream-Output', '1')
      }

      return reply({
        Message: 'Block was unwanted before it could be remotely retrieved',
        Code: 0
      }).code(404)
    })
  }
}

exports.put = {
  // pre request handler that parses the args and returns `data` which is assigned to `request.pre.args`
  parseArgs: (request, reply) => {
    if (!request.payload) {
      return reply({
        Message: "File argument 'data' is required",
        Code: 0
      }).code(400).takeover()
    }

    const parser = multipart.reqParser(request.payload)
    var file

    parser.on('file', (fileName, fileStream) => {
      file = Buffer.alloc(0)

      fileStream.on('data', (data) => {
        file = Buffer.concat([file, data])
      })
    })

    parser.on('end', () => {
      if (!file) {
        return reply({
          Message: "File argument 'data' is required",
          Code: 0
        }).code(400).takeover()
      }

      return reply({
        data: file
      })
    })
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const data = request.pre.args.data
    const ipfs = request.server.app.ipfs

    ipfs.block.put(data, {
      mhtype: request.query.mhtype,
      format: request.query.format,
      version: request.query.version && parseInt(request.query.version)
    }, (err, block) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to put block: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Key: block.cid.toBaseEncodedString(),
        Size: block.data.length
      })
    })
  }
}

exports.del = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.block.rm(key, (err, block) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to delete block: ' + err,
          Code: 0
        }).code(500)
      }

      return reply()
    })
  }
}

exports.stat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    request.server.app.ipfs.block.stat(key, (err, stats) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get block stats: ' + err,
          Code: 0
        }).code(500)
      }

      return reply({
        Key: stats.key,
        Size: stats.size
      })
    })
  }
}
