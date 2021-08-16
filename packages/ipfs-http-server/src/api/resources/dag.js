'use strict'

const multipart = require('../../utils/multipart-request-parser')
const streamResponse = require('../../utils/stream-response')
const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const all = require('it-all')
const { pipe } = require('it-pipe')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')

/**
 * @param {undefined | Uint8Array | Record<string, any>} obj
 * @param {'base64pad' | 'base16' | 'utf8'} encoding
 */
const encodeBufferKeys = (obj, encoding) => {
  if (!obj) {
    return obj
  }

  if (obj instanceof Uint8Array) {
    return uint8ArrayToString(obj, encoding)
  }

  Object.keys(obj).forEach(key => {
    if (obj[key] instanceof Uint8Array) {
      obj[key] = uint8ArrayToString(obj[key], encoding)

      return
    }

    if (typeof obj[key] === 'object') {
      obj[key] = encodeBufferKeys(obj[key], encoding)
    }
  })

  return obj
}

exports.get = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.cidAndPath().required(),
        dataEncoding: Joi.string()
          .valid('ascii', 'base64pad', 'base16', 'utf8')
          .replace(/text/, 'ascii')
          .replace(/base64/, 'base64pad')
          .replace(/hex/, 'base16')
          .default('utf8'),
        timeout: Joi.timeout()
      })
        .rename('data-encoding', 'dataEncoding', {
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
        arg: {
          cid,
          path
        },
        dataEncoding,
        timeout
      }
    } = request

    let result

    try {
      result = await ipfs.dag.get(cid, {
        path,
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.badRequest(err)
    }

    let value = result.value

    if (!(result.value instanceof Uint8Array) && result.value.toJSON) {
      value = result.value.toJSON()
    }

    try {
      result.value = encodeBufferKeys(value, dataEncoding)
    } catch (err) {
      throw Boom.boomify(err)
    }

    return h.response(result.value)
  }
}

exports.put = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    pre: [{
      assign: 'args',
      /**
       * @param {import('../../types').Request} request
       * @param {import('@hapi/hapi').ResponseToolkit} _h
       */
      method: async (request, _h) => {
        if (!request.payload) {
          throw Boom.badRequest("File argument 'object data' is required")
        }

        const enc = request.query.inputEncoding

        if (!request.headers['content-type']) {
          throw Boom.badRequest("File argument 'object data' is required")
        }

        let data

        for await (const part of multipart(request.raw.req)) {
          if (part.type !== 'file') {
            continue
          }

          data = Buffer.concat(await all(part.content))
        }

        if (!data) {
          throw Boom.badRequest("File argument 'object data' is required")
        }

        let format = request.query.format

        if (format === 'cbor') {
          format = 'dag-cbor'
        }

        let node

        if (format === 'raw') {
          node = data
        } else if (enc === 'json') {
          try {
            node = JSON.parse(data.toString())
          } catch (err) {
            throw Boom.badRequest('Failed to parse the JSON: ' + err)
          }
        } else {
          // the node is an uncommon format which the client should have
          // serialized so add it to the block store and fetch it deserialized
          // before continuing
          const cidVersion = format === 'dag-pb' && request.query.hashAlg === 'sha2-256' ? request.query.version : 1

          const cid = await request.server.app.ipfs.block.put(data, {
            version: cidVersion,
            format,
            mhtype: request.query.hash
          })

          const {
            value
          } = await request.server.app.ipfs.dag.get(cid)
          node = value
        }

        return {
          node,
          format,
          hashAlg: request.query.hash
        }
      }
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        format: Joi.string().default('cbor'),
        inputEncoding: Joi.string().default('json'),
        pin: Joi.boolean().default(false),
        hash: Joi.string().default('sha2-256'),
        cidBase: Joi.string().default('base32'),
        version: Joi.number().integer().valid(0, 1).default(1),
        timeout: Joi.timeout()
      })
        .rename('input-enc', 'inputEncoding', {
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
      pre: {
        args: {
          node,
          format,
          hashAlg
        }
      },
      query: {
        pin,
        cidBase,
        timeout,
        version
      }
    } = request

    const cidVersion = format === 'dag-pb' && hashAlg === 'sha2-256' ? version : 1
    let cid

    try {
      cid = await ipfs.dag.put(node, {
        format,
        hashAlg,
        version: cidVersion,
        pin,
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to put node' })
    }

    const base = await ipfs.bases.getBase(cidVersion === 0 ? 'base58btc' : cidBase)

    return h.response({
      Cid: {
        '/': cid.toString(base.encoder)
      }
    })
  }
}

exports.resolve = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.cidAndPath().required(),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout(),
        path: Joi.string()
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
        arg: {
          cid,
          path
        },
        cidBase,
        timeout,
        path: queryPath
      }
    } = request

    // to be consistent with go we need to return the CID to the last node we've traversed
    // along with the path inside that node as the remainder path
    try {
      const result = await ipfs.dag.resolve(cid, {
        path: path || queryPath,
        signal,
        timeout
      })

      const base = await ipfs.bases.getBase(cidBase)

      return h.response({
        Cid: {
          '/': result.cid.toString(base.encoder)
        },
        RemPath: result.remainderPath
      })
    } catch (err) {
      throw Boom.boomify(err)
    }
  }
}

exports.export = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        root: Joi.cid().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'root', {
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
        root,
        timeout
      }
    } = request

    return streamResponse(request, h, () => ipfs.dag.export(root, {
      timeout,
      signal
    }), {
      onError (err) {
        err.message = 'Failed to export DAG: ' + err.message
      }
    })
  }
}

exports.import = {
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
      query: Joi.object().keys({
        pinRoots: Joi.boolean().default(true),
        timeout: Joi.timeout()
      })
        .rename('pin-roots', 'pinRoots', {
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
        pinRoots,
        timeout
      }
    } = request

    let filesParsed = false

    return streamResponse(request, h, () => pipe(
      multipart(request.raw.req),
      /**
       * @param {AsyncIterable<import('../../types').MultipartEntry>} source
       */
      async function * (source) {
        for await (const entry of source) {
          if (entry.type !== 'file') {
            throw Boom.badRequest('Unexpected upload type')
          }

          filesParsed = true
          yield entry.content
        }
      },
      /**
       * @param {AsyncIterable<AsyncIterable<Uint8Array>>} source
       */
      async function * (source) {
        yield * ipfs.dag.import(source, {
          pinRoots,
          timeout,
          signal
        })
      },
      /**
       * @param {AsyncIterable<import('ipfs-core-types/src/dag').ImportResult>} source
       */
      async function * (source) {
        for await (const res of source) {
          yield {
            Root: {
              Cid: {
                '/': res.root.cid.toString()
              },
              PinErrorMsg: res.root.pinErrorMsg
            }
          }
        }
      }
    ), {
      onError (err) {
        err.message = 'Failed to import DAG: ' + err.message
      },
      onEnd () {
        if (!filesParsed) {
          throw Boom.badRequest("File argument 'data' is required.")
        }
      }
    })
  }
}
