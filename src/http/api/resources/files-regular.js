'use strict'

const multipart = require('ipfs-multipart')
const debug = require('debug')
const tar = require('tar-stream')
const log = debug('ipfs:http-api:files')
log.error = debug('ipfs:http-api:files:error')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const pushable = require('pull-pushable')
const toStream = require('pull-stream-to-stream')
const abortable = require('pull-abortable')
const Joi = require('@hapi/joi')
const Boom = require('boom')
const ndjson = require('pull-ndjson')
const { PassThrough } = require('readable-stream')
const multibase = require('multibase')
const isIpfs = require('is-ipfs')
const promisify = require('promisify-es6')
const { cidToString } = require('../../../utils/cid')
const { Format } = require('../../../core/components/files-regular/refs')

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
exports.parseKey = (request, h) => {
  const { arg } = request.query

  if (!arg) {
    throw Boom.badRequest("Argument 'key' is required")
  }

  if (!isIpfs.ipfsPath(arg) && !isIpfs.cid(arg) && !isIpfs.ipfsPath('/ipfs/' + arg)) {
    throw Boom.badRequest('invalid ipfs ref path')
  }

  return {
    key: arg,
    options: {
      offset: numberFromQuery(request.query, 'offset'),
      length: numberFromQuery(request.query, 'length')
    }
  }
}

exports.cat = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key, options } = request.pre.args

    const stream = await new Promise((resolve, reject) => {
      let pusher
      let started = false

      pull(
        ipfs.catPullStream(key, options),
        pull.drain(
          chunk => {
            if (!started) {
              started = true
              pusher = pushable()
              resolve(toStream.source(pusher).pipe(new PassThrough()))
            }
            pusher.push(chunk)
          },
          err => {
            if (err) {
              log.error(err)

              // We already started flowing, abort the stream
              if (started) {
                return pusher.end(err)
              }

              err.message = err.message === 'No such file'
                ? err.message
                : 'Failed to cat file: ' + err

              return reject(err)
            }

            pusher.end()
          }
        )
      )
    })

    return h.response(stream).header('X-Stream-Output', '1')
  }
}

exports.get = {
  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args
    const pack = tar.pack()

    let filesArray
    try {
      filesArray = await ipfs.get(key)
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get key' })
    }

    pack.entry = promisify(pack.entry.bind(pack))

    Promise
      .all(filesArray.map(file => {
        const header = { name: file.path }

        if (file.content) {
          header.size = file.size
          return pack.entry(header, file.content)
        } else {
          header.type = 'directory'
          return pack.entry(header)
        }
      }))
      .then(() => pack.finalize())
      .catch(err => {
        log.error(err)
        pack.emit('error', err)
        pack.destroy()
      })

    // reply must be called right away so that tar-stream offloads its content
    // otherwise it will block in large files
    return h.response(pack).header('X-Stream-Output', '1')
  }
}

exports.add = {
  validate: {
    query: Joi.object()
      .keys({
        'cid-version': Joi.number().integer().min(0).max(1).default(0),
        'cid-base': Joi.string().valid(multibase.names),
        'raw-leaves': Joi.boolean(),
        'only-hash': Joi.boolean(),
        pin: Joi.boolean().default(true),
        'wrap-with-directory': Joi.boolean(),
        chunker: Joi.string()
      })
      // TODO: Necessary until validate "recursive", "stream-channels" etc.
      .options({ allowUnknown: true })
  },

  async handler (request, h) {
    if (!request.payload) {
      throw Boom.badRequest('Array, Buffer, or String is required.')
    }

    const { ipfs } = request.server.app

    const fileAdder = await new Promise((resolve, reject) => {
      // TODO: make pull-multipart
      const parser = multipart.reqParser(request.payload)
      let filesParsed = false
      const adder = pushable()

      parser.on('file', (fileName, fileStream) => {
        if (!filesParsed) {
          resolve(adder)
          filesParsed = true
        }

        adder.push({
          path: decodeURIComponent(fileName),
          content: toPull(fileStream)
        })
      })

      parser.on('directory', (dirName) => {
        adder.push({
          path: decodeURIComponent(dirName),
          content: ''
        })
      })

      parser.on('end', () => {
        if (!filesParsed) {
          reject(new Error("File argument 'data' is required."))
        }
        adder.end()
      })
    })

    const replyStream = pushable()
    const progressHandler = bytes => replyStream.push({ Bytes: bytes })

    const options = {
      cidVersion: request.query['cid-version'],
      rawLeaves: request.query['raw-leaves'],
      progress: request.query.progress ? progressHandler : null,
      onlyHash: request.query['only-hash'],
      hashAlg: request.query.hash,
      wrapWithDirectory: request.query['wrap-with-directory'],
      pin: request.query.pin,
      chunker: request.query.chunker
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

    let filesAdded = false

    pull(
      fileAdder,
      ipfs.addPullStream(options),
      pull.map(file => ({
        Name: file.path, // addPullStream already turned this into a hash if it wanted to
        Hash: cidToString(file.hash, { base: request.query['cid-base'] }),
        Size: file.size
      })),
      pull.drain(
        file => {
          replyStream.push(file)
          filesAdded = true
        },
        err => {
          if (err || !filesAdded) {
            request.raw.res.addTrailers({
              'X-Stream-Error': JSON.stringify({
                Message: err ? err.message : 'Failed to add files.',
                Code: 0
              })
            })
            return aborter.abort()
          }

          replyStream.end()
        }
      )
    )

    return h.response(stream)
      .header('x-chunked-output', '1')
      .header('content-type', 'application/json')
      .header('Trailer', 'X-Stream-Error')
  }
}

exports.ls = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(multibase.names)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args
    const recursive = request.query && request.query.recursive === 'true'
    const cidBase = request.query['cid-base']

    let files
    try {
      files = await ipfs.ls(key, { recursive })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to list dir' })
    }

    return h.response({
      Objects: [{
        Hash: key,
        Links: files.map((file) => ({
          Name: file.name,
          Hash: cidToString(file.hash, { base: cidBase }),
          Size: file.size,
          Type: toTypeCode(file.type),
          Depth: file.depth
        }))
      }]
    })
  }
}

exports.refs = {
  validate: {
    query: Joi.object().keys({
      r: Joi.boolean().default(false),
      recursive: Joi.boolean().default(false),
      format: Joi.string().default(Format.default),
      e: Joi.boolean().default(false),
      edges: Joi.boolean().default(false),
      u: Joi.boolean().default(false),
      unique: Joi.boolean().default(false),
      'max-depth': Joi.number().integer().min(-1),
      maxDepth: Joi.number().integer().min(-1)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args
    const recursive = request.query.r === 'true' || request.query.recursive === 'true'
    const format = request.query.format
    const e = request.query.e === 'true' || request.query.edges === 'true'
    const u = request.query.u === 'true' || request.query.unique === 'true'
    let maxDepth = request.query['max-depth'] || request.query.maxDepth
    if (typeof maxDepth === 'string') {
      maxDepth = parseInt(maxDepth)
    }

    let refs
    try {
      refs = await ipfs.refs(key, { recursive, format, e, u, maxDepth })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get refs for path' })
    }

    return h.response(refs)
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
