'use strict'

const multipart = require('../../utils/multipart-request-parser')
const debug = require('debug')
const tar = require('it-tar')
const log = debug('ipfs:http-api:files')
log.error = debug('ipfs:http-api:files:error')
const toIterable = require('stream-to-it')
const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const { PassThrough } = require('stream')
const { cidToString } = require('../../../utils/cid')
const { Format } = require('../../../core/components/refs')
const pipe = require('it-pipe')
const all = require('it-all')
const ndjson = require('iterable-ndjson')
const { map } = require('streaming-iterables')
const streamResponse = require('../../utils/stream-response')

const toBuffer = async function * (source) {
  for await (const chunk of source) {
    yield chunk.slice()
  }
}

exports.cat = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object()
        .keys({
          path: Joi.ipfsPath().required(),
          offset: Joi.number().integer().min(0),
          length: Joi.number().integer().min(1),
          timeout: Joi.timeout()
        })
        .rename('arg', 'path', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        path,
        offset,
        length,
        timeout
      }
    } = request

    return streamResponse(request, h, () => ipfs.cat(path, {
      offset,
      length,
      timeout,
      signal
    }), {
      onError (err) {
        err.message = err.message === 'file does not exist'
          ? err.message
          : 'Failed to cat file: ' + err.message
      }
    })
  }
}

exports.get = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object()
        .keys({
          path: Joi.ipfsPath().required(),
          archive: Joi.boolean().default(false),
          compress: Joi.boolean().default(false),
          compressionLevel: Joi.number().integer().min(1).max(9),
          timeout: Joi.timeout()
        })
        .rename('arg', 'path', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
  handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        path,
        archive,
        compress,
        compressionLevel,
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.get(path, {
        archive,
        compress,
        compressionLevel,
        timeout,
        signal
      }),
      async function * (source) {
        for await (const file of source) {
          const header = {
            name: file.path
          }

          if (file.content) {
            yield { header: { ...header, size: file.size }, body: toBuffer(file.content) }
          } else {
            yield { header: { ...header, type: 'directory' } }
          }
        }
      },
      tar.pack(),
      toBuffer
    ))
  }
}

exports.add = {
  options: {
    payload: {
      parse: false,
      output: 'stream',
      maxBytes: Number.MAX_SAFE_INTEGER
    },
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object()
        .keys({
          cidVersion: Joi.number().integer().min(0).max(1),
          hashAlg: Joi.string(),
          cidBase: Joi.cidBase(),
          rawLeaves: Joi.boolean(),
          onlyHash: Joi.boolean(),
          pin: Joi.boolean(),
          wrapWithDirectory: Joi.boolean(),
          fileImportConcurrency: Joi.number().integer().min(0),
          blockWriteConcurrency: Joi.number().integer().min(0),
          shardSplitThreshold: Joi.number().integer().min(0),
          chunker: Joi.string(),
          trickle: Joi.boolean(),
          preload: Joi.boolean(),
          progress: Joi.boolean()
        })
        .rename('cid-version', 'cidVersion', {
          override: true,
          ignoreUndefined: true
        })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('hash', 'hashAlg', {
          override: true,
          ignoreUndefined: true
        })
        .rename('raw-leaves', 'rawLeaves', {
          override: true,
          ignoreUndefined: true
        })
        .rename('only-hash', 'onlyHash', {
          override: true,
          ignoreUndefined: true
        })
        .rename('wrap-with-directory', 'wrapWithDirectory', {
          override: true,
          ignoreUndefined: true
        })
        .rename('file-import-concurrency', 'fileImportConcurrency', {
          override: true,
          ignoreUndefined: true
        })
        .rename('block-write-concurrency', 'blockWriteConcurrency', {
          override: true,
          ignoreUndefined: true
        })
        .rename('shard-split-threshold', 'shardSplitThreshold', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  handler (request, h) {
    if (!request.payload) {
      throw Boom.badRequest('Array, Buffer, or String is required.')
    }

    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        cidVersion,
        cidBase,
        rawLeaves,
        progress,
        onlyHash,
        hashAlg,
        wrapWithDirectory,
        pin,
        chunker,
        trickle,
        preload,
        shardSplitThreshold,
        blockWriteConcurrency,
        timeout
      }
    } = request

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
              content: entry.content,
              mode: entry.mode,
              mtime: entry.mtime
            }
          }

          if (entry.type === 'directory') {
            filesParsed = true

            yield {
              path: entry.name,
              mode: entry.mode,
              mtime: entry.mtime
            }
          }
        }
      },
      function (source) {
        return ipfs.addAll(source, {
          cidVersion,
          rawLeaves,
          progress: progress ? progressHandler : () => {},
          onlyHash,
          hashAlg,
          wrapWithDirectory,
          pin,
          chunker,
          trickle,
          preload,
          shardSplitThreshold,

          // this has to be hardcoded to 1 because we can only read one file
          // at a time from a http request and we have to consume it completely
          // before we can read the next file
          fileImportConcurrency: 1,
          blockWriteConcurrency,
          signal,
          timeout
        })
      },
      map(file => {
        const entry = {
          Name: file.path,
          Hash: cidToString(file.cid, { base: cidBase }),
          Size: file.size,
          Mode: file.mode === undefined ? undefined : file.mode.toString(8).padStart(4, '0')
        }

        if (file.mtime) {
          entry.Mtime = file.mtime.secs
          entry.MtimeNsecs = file.mtime.nsecs
        }

        return entry
      }),
      ndjson.stringify,
      toIterable.sink(output)
    )
      .then(() => {
        if (!filesParsed) {
          throw new Error("File argument 'data' is required.")
        }
      })
      .catch(err => {
        log.error(err)

        if (!filesParsed && output.writable) {
          output.write(' ')
        }

        request.raw.res.addTrailers({
          'X-Stream-Error': JSON.stringify({
            Message: err.message,
            Code: 0
          })
        })
      })
      .finally(() => {
        output.end()
      })

    return h.response(output)
      .header('x-chunked-output', '1')
      .header('content-type', 'application/json')
      .header('Trailer', 'X-Stream-Error')
  }
}

exports.ls = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object()
        .keys({
          path: Joi.ipfsPath().required(),
          cidBase: Joi.cidBase(),
          stream: Joi.boolean().default(false),
          recursive: Joi.boolean().default(false),
          timeout: Joi.timeout()
        })
        .rename('arg', 'path', {
          override: true,
          ignoreUndefined: true
        })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        path,
        cidBase,
        recursive,
        stream,
        timeout
      }
    } = request

    const mapLink = link => {
      const output = {
        Name: link.name,
        Hash: cidToString(link.cid, { base: cidBase }),
        Size: link.size,
        Type: toTypeCode(link.type),
        Depth: link.depth
      }

      if (link.mode != null) {
        output.Mode = link.mode.toString(8).padStart(4, '0')
      }

      if (link.mtime) {
        output.Mtime = link.mtime.secs

        if (link.mtime.nsecs !== null && link.mtime.nsecs !== undefined) {
          output.MtimeNsecs = link.mtime.nsecs
        }
      }

      return output
    }

    if (!stream) {
      try {
        const links = await all(ipfs.ls(path, {
          recursive,
          signal,
          timeout
        }))

        return h.response({ Objects: [{ Hash: path, Links: links.map(mapLink) }] })
      } catch (err) {
        throw Boom.boomify(err, { message: 'Failed to list dir' })
      }
    }

    return streamResponse(request, h, () => pipe(
      ipfs.ls(path, {
        recursive,
        signal,
        timeout
      }),
      map(link => ({ Objects: [{ Hash: path, Links: [mapLink(link)] }] })),
      ndjson.stringify
    ))
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
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        paths: Joi.array().single().items(Joi.ipfsPath()),
        recursive: Joi.boolean().default(false),
        format: Joi.string().default(Format.default),
        edges: Joi.boolean().default(false),
        unique: Joi.boolean().default(false),
        maxDepth: Joi.number().integer().min(-1),
        timeout: Joi.timeout()
      })
        .rename('max-depth', 'maxDepth', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'paths', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        paths,
        recursive,
        format,
        edges,
        unique,
        maxDepth,
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.refs(paths, {
        recursive,
        format,
        edges,
        unique,
        maxDepth,
        signal,
        timeout
      }),
      map(({ ref, err }) => ({ Ref: ref, Err: err })),
      ndjson.stringify
    ))
  }
}

exports.refsLocal = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        timeout: Joi.timeout()
      })
    }
  },
  handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.refs.local({
        signal,
        timeout
      }),
      map(({ ref, err }) => ({ Ref: ref, Err: err })),
      ndjson.stringify
    ))
  }
}
