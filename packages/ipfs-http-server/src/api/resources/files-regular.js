import { multipartRequestParser } from '../../utils/multipart-request-parser.js'
import Joi from '../../utils/joi.js'
import Boom from '@hapi/boom'
import { pipe } from 'it-pipe'
import all from 'it-all'
import { streamResponse } from '../../utils/stream-response.js'
import merge from 'it-merge'
import map from 'it-map'
import { PassThrough } from 'stream'

export const catResource = {
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

export const getResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object()
        .keys({
          path: Joi.ipfsPath().required(),
          archive: Joi.boolean(),
          compress: Joi.boolean(),
          compressionLevel: Joi.number().integer().min(1).max(9),
          timeout: Joi.timeout()
        })
        .rename('arg', 'path', {
          override: true,
          ignoreUndefined: true
        })
        .rename('compression-level', 'compressionLevel', {
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
        archive,
        compress,
        compressionLevel,
        timeout
      }
    } = request

    return streamResponse(request, h, () => ipfs.get(path, {
      timeout,
      archive,
      compress,
      compressionLevel,
      signal
    }))
  }
}

export const addResource = {
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
          cidBase: Joi.string().default('base58btc'),
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

    return streamResponse(request, h, () => pipe(
      multipartRequestParser(request.raw.req),
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
      async function * (source) {
        const progressStream = new PassThrough({
          objectMode: true
        })

        yield * merge(
          progressStream,
          pipe(
            ipfs.addAll(source, {
              cidVersion,
              rawLeaves,
              progress: progress
                ? (bytes, path) => {
                    progressStream.write({
                      Name: path,
                      Bytes: bytes
                    })
                  }
                : () => {},
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
            }),
            async function * (source) {
              const base = await ipfs.bases.getBase(cidBase)

              yield * map(source, file => {
                return {
                  Name: file.path,
                  Hash: file.cid.toString(base.encoder),
                  Size: file.size,
                  Mode: file.mode === undefined ? undefined : file.mode.toString(8).padStart(4, '0'),
                  Mtime: file.mtime ? file.mtime.secs : undefined,
                  MtimeNsecs: file.mtime ? file.mtime.nsecs : undefined
                }
              })

              // no more files, end the progress stream
              progressStream.end()
            }
          )
        )
      }
    ), {
      onEnd () {
        if (!filesParsed) {
          throw Boom.badRequest("File argument 'data' is required.")
        }
      }
    })
  }
}

export const lsResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object()
        .keys({
          path: Joi.ipfsPath().required(),
          cidBase: Joi.string().default('base58btc'),
          stream: Joi.boolean().default(false),
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
        stream,
        timeout
      }
    } = request

    const base = await ipfs.bases.getBase(cidBase)

    /**
     * TODO: can be ipfs.files.stat result or ipfs.ls result
     *
     * @param {any} link
     */
    const mapLink = link => {
      return {
        Hash: link.cid.toString(base.encoder),
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
          signal,
          timeout
        }))

        return h.response({ Objects: [{ Hash: path, Links: links.map(mapLink) }] })
      } catch (/** @type {any} */ err) {
        throw Boom.boomify(err, { message: 'Failed to list dir' })
      }
    }
    return streamResponse(request, h, () => pipe(
      ipfs.ls(path, {
        signal,
        timeout
      }),
      async function * (source) {
        yield * map(source, link => ({ Objects: [{ Hash: path, Links: [mapLink(link)] }] }))
      }
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

export const refsResource = {
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
      async function * (source) {
        yield * map(source, ({ ref, err }) => ({ Ref: ref, Err: err }))
      }
    ))
  }
}

export const refsLocalResource = {
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
      async function * (source) {
        yield * map(source, ({ ref, err }) => ({ Ref: ref, Err: err }))
      }
    ))
  }
}
