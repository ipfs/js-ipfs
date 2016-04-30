'use strict'

const bs58 = require('bs58')
const streamifier = require('streamifier')
const multipart = require('ipfs-multipart')
const debug = require('debug')
const log = debug('http-api:files')
log.error = debug('http-api:files:error')

exports = module.exports

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, reply) => {
  //console.log(request)
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
  parseArgs: (request, reply) => {
    if (!request.payload) {
      console.log('this is never false')
      // This is never false
      return reply("Array, Buffer, or String is required").code(400).takeover()
    }

    const parser = multipart.reqParser(request.payload)
    var file
    var tuples = []

    parser.on('file', (fileName, fileStream) => {
      fileStream.on('data', (data) => {
        const r = streamifier.createReadStream(data)
        const filePair = {path: fileName, stream: r}
        tuples.push(filePair)
        file = data
      })
    })

    parser.on('end', () => {
      if (!file) {
        return reply("File argument 'data' is required").code(400).takeover()
      }
      return reply({
          arr: tuples
        })
    })
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const array = request.pre.args.arr

    request.server.app.ipfs.files.add(array, (err, obj) => {
      if (err) {
        log.error(err)
        return reply({
          Message: 'Failed to add files: ' + err,
          Code: 0
        }).code(500)
      }
      var formatArray = obj.map((link) => ({
          Name: link.path,
          Hash: bs58.encode(link.multihash).toString()
        }))
      return reply(formatArray)
    })
  }
}
