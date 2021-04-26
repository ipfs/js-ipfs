'use strict'

const multipart = require('../../utils/multipart-request-parser')
const debug = require('debug')
// @ts-ignore no types
const tar = require('it-tar')
const log = Object.assign(debug('ipfs:http-api:files'), {
  error: debug('ipfs:http-api:files:error')
})
// @ts-ignore no types
const toIterable = require('stream-to-it')
const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const { PassThrough } = require('stream')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { pipe } = require('it-pipe')
const all = require('it-all')
// @ts-ignore no types
const ndjson = require('iterable-ndjson')
const { map } = require('streaming-iterables')
const streamResponse = require('../../utils/stream-response')

/**
 * @param {AsyncIterable<Uint8Array>} source
 */
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

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.get(path, {
        timeout,
        signal
      }),
      /**
       * @param {AsyncIterable<import('ipfs-core-types/src/root').IPFSEntry>} source
       */
      async function * (source) {
        for await (const file of source) {
          const header = {
            name: file.path
          }

          if (file.type === 'file' && file.content != null) {
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

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
    const output = new PassThrough()
    /**
     * @type {import('ipfs-core-types/src/root').AddProgressFn}
     */
    const progressHandler = (bytes, path) => {
      // TODO: path should be passed as a second option
      output.write(JSON.stringify({
        Name: path,
        Bytes: bytes
      }) + '\n')
    }

    pipe(
      multipart(request.raw.req),
      /**
       * @param {AsyncIterable<import('../../types').MultipartEntry>} source
       */
      async function * (source) {
        for await (const entry of source) {
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
      /**
       * @param {import('ipfs-core-types/src/utils').ImportSource} source
       */
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
        return {
          Name: file.path,
          Hash: cidToString(file.cid, { base: cidBase }),
          Size: file.size,
          Mode: file.mode === undefined ? undefined : file.mode.toString(8).padStart(4, '0'),
          Mtime: file.mtime ? file.mtime.secs : undefined,
          MtimeNsecs: file.mtime ? file.mtime.nsecs : undefined
        }
      }),
      ndjson.stringify,
      toIterable.sink(output)
    )
      .then(() => {
        if (!filesParsed) {
          throw new Error("File argument 'data' is required.")
        }
      })
      .catch((/** @type {Error} */ err) => {
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

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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

    /**
     * TODO: can be ipfs.files.stat result or ipfs.ls result
     *
     * @param {any} link
     */
    const mapLink = link => {
      return {
        Hash: cidToString(link.cid, { base: cidBase }),
        Size: link.size,
        Type: toTypeCode(link.type),
        Depth: link.depth,
        Name: link.name ? link.name : undefined,
        Mode: link.mode != null ? link.mode.toString(8).padStart(4, '0') : undefined,
        Mtime: link.mtime ? link.mtime.secs : undefined,
        MtimeNsecs: link.mtime ? link.mtime.nsecs : undefined
      }
    }

    const stat = await ipfs.files.stat(path.startsWith('/ipfs/') ? path : `/ipfs/${path}`, {
      signal,
      timeout
    })

    if (stat.type === 'file') {
      // return single object with metadata
      return h.response({
        Objects: [{
          ...mapLink(stat),
          Hash: path,
          Depth: 1,
          Links: []
        }]
      })
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

/**
 * @param {string} type
 */
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
        edges: Joi.boolean().default(false),
        unique: Joi.boolean().default(false),
        maxDepth: Joi.number().integer().min(-1),
        format: Joi.string(),
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

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
        edges,
        unique,
        maxDepth,
        format,
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.refs(paths, {
        recursive,
        edges,
        unique,
        maxDepth,
        format,
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

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
