'use strict'

const multipart = require('ipfs-multipart')
const debug = require('debug')
const tar = require('tar-stream')
const log = debug('ipfs:http-api:files')
log.error = debug('ipfs:http-api:files:error')
const pull = require('pull-stream')
const pushable = require('pull-pushable')
const toStream = require('pull-stream-to-stream')
const abortable = require('pull-abortable')
const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const ndjson = require('pull-ndjson')
const { PassThrough } = require('readable-stream')
const multibase = require('multibase')
const isIpfs = require('is-ipfs')
const promisify = require('promisify-es6')
const { cidToString } = require('../../../utils/cid')
const { Format } = require('../../../core/components/files-regular/refs')
const pipe = require('it-pipe')

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

  const isArray = Array.isArray(arg)
  const args = isArray ? arg : [arg]
  for (const arg of args) {
    if (!isIpfs.ipfsPath(arg) && !isIpfs.cid(arg) && !isIpfs.ipfsPath('/ipfs/' + arg)) {
      throw Boom.badRequest(`invalid ipfs ref path '${arg}'`)
    }
  }

  return {
    key: isArray ? args : arg,
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

              err.message = err.message === 'file does not exist'
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
        'cid-base': Joi.string().valid(...multibase.names),
        'raw-leaves': Joi.boolean(),
        'only-hash': Joi.boolean(),
        pin: Joi.boolean().default(true),
        'wrap-with-directory': Joi.boolean(),
        chunker: Joi.string(),
        trickle: Joi.boolean(),
        preload: Joi.boolean().default(true)
      })
      // TODO: Necessary until validate "recursive", "stream-channels" etc.
      .options({ allowUnknown: true })
  },

  handler (request, h) {
    if (!request.payload) {
      throw Boom.badRequest('Array, Buffer, or String is required.')
    }

    const { ipfs } = request.server.app
    let filesParsed = false
    let currentFileName
    const output = new PassThrough()
    const progressHandler = bytes => {
      output.write(JSON.stringify({
        Name: currentFileName,
        Bytes: bytes
      }) + '\n')
    }

    pipe(
      multipart(request),
      async function * (source) {
        for await (const entry of source) {
          currentFileName = entry.name || 'unknown'

          if (entry.type === 'file') {
            filesParsed = true

            yield {
              path: entry.name,
              content: entry.content
            }
          }

          if (entry.type === 'directory') {
            filesParsed = true

            yield {
              path: entry.name
            }
          }
        }
      },
      function (source) {
        return ipfs._addAsyncIterator(source, {
          cidVersion: request.query['cid-version'],
          rawLeaves: request.query['raw-leaves'],
          progress: request.query.progress ? progressHandler : null,
          onlyHash: request.query['only-hash'],
          hashAlg: request.query.hash,
          wrapWithDirectory: request.query['wrap-with-directory'],
          pin: request.query.pin,
          chunker: request.query.chunker,
          trickle: request.query.trickle,
          preload: request.query.preload
        })
      },
      async function (source) {
        for await (const file of source) {
          output.write(JSON.stringify({
            Name: file.path,
            Hash: cidToString(file.hash, { base: request.query['cid-base'] }),
            Size: file.size
          }) + '\n')
        }
      }
    )
      .then(() => {
        if (!filesParsed) {
          throw new Error("File argument 'data' is required.")
        }
      })
      .catch(err => {
        if (!filesParsed) {
          output.write(' ')
        }

        request.raw.res.addTrailers({
          'X-Stream-Error': JSON.stringify({
            Message: err.message,
            Code: 0
          })
        })
      })
      .then(() => {
        output.end()
      })

    return h.response(output)
      .header('x-chunked-output', '1')
      .header('content-type', 'application/json')
      .header('Trailer', 'X-Stream-Error')
  }
}

exports.ls = {
  validate: {
    query: Joi.object().keys({
      'cid-base': Joi.string().valid(...multibase.names)
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

exports.refs = {
  validate: {
    query: Joi.object().keys({
      recursive: Joi.boolean().default(false),
      format: Joi.string().default(Format.default),
      edges: Joi.boolean().default(false),
      unique: Joi.boolean().default(false),
      'max-depth': Joi.number().integer().min(-1)
    }).unknown()
  },

  // uses common parseKey method that returns a `key`
  parseArgs: exports.parseKey,

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler (request, h) {
    const { ipfs } = request.server.app
    const { key } = request.pre.args

    const recursive = request.query.recursive
    const format = request.query.format
    const edges = request.query.edges
    const unique = request.query.unique
    const maxDepth = request.query['max-depth']

    // have to do this here otherwise the validation error appears in the stream tail and
    // this doesn't work in browsers: https://github.com/ipfs/js-ipfs/issues/2519
    if (edges && format !== Format.default) {
      throw Boom.badRequest('Cannot set edges to true and also specify format')
    }

    const source = ipfs.refsPullStream(key, { recursive, format, edges, unique, maxDepth })
    return sendRefsReplyStream(request, h, `refs for ${key}`, source)
  }
}

exports.refs.local = {
  // main route handler
  handler (request, h) {
    const { ipfs } = request.server.app
    const source = ipfs.refs.localPullStream()
    return sendRefsReplyStream(request, h, 'local refs', source)
  }
}

function sendRefsReplyStream (request, h, desc, source) {
  const replyStream = pushable()
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

  pull(
    source,
    pull.drain(
      (ref) => replyStream.push({ Ref: ref.ref, Err: ref.err }),
      (err) => {
        if (err) {
          request.raw.res.addTrailers({
            'X-Stream-Error': JSON.stringify({
              Message: `Failed to get ${desc}: ${err.message || ''}`,
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
