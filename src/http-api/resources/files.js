'use strict'

const bs58 = require('bs58')
const Readable = require('stream').Readable
const multipart = require('ipfs-multipart')
const debug = require('debug')
const log = debug('http-api:files')
log.error = debug('http-api:files:error')

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

exports.add = {
  // pre request handler that parses the args and returns `node` which is assigned to `request.pre.args`
  handler: (request, reply) => {
    if (!request.payload) {
      return reply('Array, Buffer, or String is required').code(400).takeover()
    }
    const parser = multipart.reqParser(request.payload)
    var file = false
    var filePair
    var resArr = []
    var outCounter = 0
    var inCounter = 0
    var i = request.server.app.ipfs.files.add()

    i.on('data', (file) => {
      outCounter++
      resArr.push({
        Name: file.path,
        Hash: bs58.encode(file.multihash).toString()
      })
      if (inCounter === outCounter) {
        if (resArr.length === 0) {
          return reply({
            Message: 'Failed to add files',
            Code: 0
          }).code(500)
        }
        return reply(resArr)
      }
    })

    parser.on('file', (fileName, fileStream) => {
      inCounter++
      var rs = new Readable()
      fileStream.on('data', (data) => {
        rs.push(data)
        file = true
      })
      fileStream.on('end', () => {
        rs.push(null)
        filePair = {path: fileName, stream: rs}
        i.write(filePair)
      })
    })

    parser.on('end', () => {
      i.end()
      if (!file) {
        return reply("File argument 'data' is required").code(400).takeover()
      }
    })
  }
}

exports.cat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.files.cat(key, (err, ee) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }
      ee.on('file', (data) => {
        return reply(data)
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

    request.server.app.ipfs.files.get(key, (err, ee) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to get object: ' + err,
          Code: 0
        }).code(500)
      }

      return reply(ee)
    })
  }
}
