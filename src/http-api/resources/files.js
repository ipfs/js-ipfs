'use strict'

const bs58 = require('bs58')
const ndjson = require('ndjson')
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

exports.cat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key

    request.server.app.ipfs.files.cat(key, (err, stream) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to cat file: ' + err,
          Code: 0
        }).code(500)
      }
      return reply(stream).header('X-Stream-Output', '1')
    })
  }
}

exports.add = {
  handler: (request, reply) => {
    if (!request.payload) {
      return reply('Array, Buffer, or String is required.').code(400).takeover()
    }

    const parser = multipart.reqParser(request.payload)

    var filesParsed = false
    var filesAdded = 0

    var serialize = ndjson.serialize()
    // hapi doesn't permit object streams: http://hapijs.com/api#replyerr-result
    serialize._readableState.objectMode = false

    request.server.app.ipfs.files.createAddStream((err, fileAdder) => {
      if (err) {
        return reply({
          Message: err,
          Code: 0
        }).code(500)
      }

      fileAdder.on('data', (file) => {
        const filePath = file.path ? file.path : file.hash
        serialize.write({
          Name: filePath,
          Hash: file.hash
        })
        filesAdded++
      })

      fileAdder.on('end', () => {
        if (filesAdded === 0 && filesParsed) {
          return reply({
            Message: 'Failed to add files.',
            Code: 0
          }).code(500)
        } else {
          serialize.end()
          return reply(serialize)
            .header('x-chunked-output', '1')
            .header('content-type', 'application/json')
        }
      })

      parser.on('file', (fileName, fileStream) => {
        var filePair = {
          path: fileName,
          content: fileStream
        }
        filesParsed = true
        fileAdder.write(filePair)
      })
      parser.on('directory', (directory) => {
        fileAdder.write({
          path: directory,
          content: ''
        })
      })

      parser.on('end', () => {
        if (!filesParsed) {
          return reply("File argument 'data' is required.").code(400).takeover()
        }
        fileAdder.end()
      })
    })
  }
}
