'use strict'

const mh = require('multihashes')
const multipart = require('ipfs-multipart')
const debug = require('debug')
const tar = require('tar-stream')
const log = debug('jsipfs:http-api:files')
log.error = debug('jsipfs:http-api:files:error')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const pushable = require('pull-pushable')
const each = require('async/each')
const toStream = require('pull-stream-to-stream')
const abortable = require('pull-abortable')
const Joi = require('joi')
const ndjson = require('pull-ndjson')

exports = module.exports

function numberFromQuery (query, key) {
  if (query && query[key] !== undefined) {
    const value = parseInt(query[key], 10)

    if (isNaN(value)) {
      return undefined
    }

    return value
  }
}

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, reply) => {
  if (!request.query.arg) {
    return reply({
      Message: "Argument 'key' is required",
      Code: 0,
      Type: 'error'
    }).code(400).takeover()
  }

  let key = request.query.arg
  if (key.indexOf('/ipfs/') === 0) {
    key = key.substring(6)
  }

  const slashIndex = key.indexOf('/')
  if (slashIndex > 0) {
    key = key.substring(0, slashIndex)
  }

  try {
    mh.fromB58String(key)
  } catch (err) {
    log.error(err)
    return reply({
      Message: 'invalid ipfs ref path',
      Code: 0,
      Type: 'error'
    }).code(500).takeover()
  }

  reply({
    key: request.query.arg,
    options: {
      offset: numberFromQuery(request.query, 'offset'),
      length: numberFromQuery(request.query, 'length')
    }
  })
}

exports.cat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const options = request.pre.args.options
    const ipfs = request.server.app.ipfs

    ipfs.files.cat(key, options, (err, stream) => {
      if (err) {
        log.error(err)
        if (err.message === 'No such file') {
          reply({Message: 'No such file', Code: 0, Type: 'error'}).code(500)
        } else {
          reply({Message: 'Failed to cat file: ' + err, Code: 0, Type: 'error'}).code(500)
        }
        return
      }

      // hapi is not very clever and throws if no
      // - _read method
      // - _readableState object
      // are there :(
      if (!stream._read) {
        stream._read = () => {}
        stream._readableState = {}
      }
      return reply(stream).header('X-Stream-Output', '1')
    })
  }
}

exports.get = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const cid = request.pre.args.key
    const ipfs = request.server.app.ipfs
    const pack = tar.pack()

    ipfs.files.get(cid, (err, filesArray) => {
      if (err) {
        log.error(err)
        pack.emit('error', err)
        pack.destroy()
        return
      }

      each(filesArray, (file, cb) => {
        const header = { name: file.path }

        if (file.content) {
          header.size = file.size
          pack.entry(header, file.content, cb)
        } else {
          header.type = 'directory'
          pack.entry(header, cb)
        }
      }, (err) => {
        if (err) {
          log.error(err)
          pack.emit('error', err)
          pack.destroy()
          return
        }

        pack.finalize()
      })

      // reply must be called right away so that tar-stream offloads its content
      // otherwise it will block in large files
      reply(pack).header('X-Stream-Output', '1')
    })
  }
}

exports.add = {
  validate: {
    query: Joi.object()
      .keys({
        'cid-version': Joi.number().integer().min(0).max(1).default(0),
        'raw-leaves': Joi.boolean(),
        'only-hash': Joi.boolean(),
        pin: Joi.boolean().default(true),
        'wrap-with-directory': Joi.boolean()
      })
      // TODO: Necessary until validate "recursive", "stream-channels" etc.
      .options({ allowUnknown: true })
  },

  handler: (request, reply) => {
    if (!request.payload) {
      return reply({
        Message: 'Array, Buffer, or String is required.',
        Code: 0,
        Type: 'error'
      }).code(400).takeover()
    }

    const ipfs = request.server.app.ipfs
    // TODO: make pull-multipart
    const parser = multipart.reqParser(request.payload)
    let filesParsed = false

    const fileAdder = pushable()

    parser.on('file', (fileName, fileStream) => {
      fileName = decodeURIComponent(fileName)
      const filePair = {
        path: fileName,
        content: toPull(fileStream)
      }
      filesParsed = true
      fileAdder.push(filePair)
    })

    parser.on('directory', (directory) => {
      directory = decodeURIComponent(directory)

      fileAdder.push({
        path: directory,
        content: ''
      })
    })

    parser.on('end', () => {
      if (!filesParsed) {
        return reply({
          Message: "File argument 'data' is required.",
          Code: 0,
          Type: 'error'
        }).code(400).takeover()
      }
      fileAdder.end()
    })

    const replyStream = pushable()
    const progressHandler = (bytes) => {
      replyStream.push({ Bytes: bytes })
    }

    const options = {
      cidVersion: request.query['cid-version'],
      rawLeaves: request.query['raw-leaves'],
      progress: request.query.progress ? progressHandler : null,
      onlyHash: request.query['only-hash'],
      hashAlg: request.query['hash'],
      wrapWithDirectory: request.query['wrap-with-directory'],
      pin: request.query.pin
    }

    const aborter = abortable()
    const stream = toStream.source(pull(
      replyStream,
      aborter,
      ndjson.serialize()
    ))

    // const stream = toStream.source(replyStream.source)
    // hapi is not very clever and throws if no
    // - _read method
    // - _readableState object
    // are there :(
    if (!stream._read) {
      stream._read = () => {}
      stream._readableState = {}
      stream.unpipe = () => {}
    }
    reply(stream)
      .header('x-chunked-output', '1')
      .header('content-type', 'application/json')
      .header('Trailer', 'X-Stream-Error')

    function _writeErr (msg, code) {
      const err = JSON.stringify({ Message: msg, Code: code })
      request.raw.res.addTrailers({
        'X-Stream-Error': err
      })
      return aborter.abort()
    }

    pull(
      fileAdder,
      ipfs.files.addPullStream(options),
      pull.map((file) => {
        return {
          Name: file.path, // addPullStream already turned this into a hash if it wanted to
          Hash: file.hash,
          Size: file.size
        }
      }),
      pull.collect((err, files) => {
        if (err) {
          return _writeErr(err, 0)
        }

        if (files.length === 0 && filesParsed) {
          return _writeErr('Failed to add files.', 0)
        }

        files.forEach((f) => replyStream.push(f))
        replyStream.end()
      })
    )
  }
}

exports.immutableLs = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler: (request, reply) => {
    const key = request.pre.args.key
    const ipfs = request.server.app.ipfs
    const recursive = request.query && request.query.recursive === 'true'

    ipfs.ls(key, { recursive: recursive }, (err, files) => {
      if (err) {
        return reply({
          Message: 'Failed to list dir: ' + err.message,
          Code: 0,
          Type: 'error'
        }).code(500).takeover()
      }

      reply({
        Objects: [{
          Hash: key,
          Links: files.map((file) => ({
            Name: file.name,
            Hash: file.hash,
            Size: file.size,
            Type: toTypeCode(file.type),
            Depth: file.depth
          }))
        }]
      })
    })
  }
}

function toTypeCode (type) {
  switch (type) {
    case 'dir':
      return 1
    case 'file':
      return 2
    default:
      return 0
  }
}
