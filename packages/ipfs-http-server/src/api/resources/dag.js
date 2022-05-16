import { multipartRequestParser } from '../../utils/multipart-request-parser.js'
import { streamResponse } from '../../utils/stream-response.js'
import Joi from '../../utils/joi.js'
import Boom from '@hapi/boom'
import all from 'it-all'
import { pipe } from 'it-pipe'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

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

export const getResource = {
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
    } catch (/** @type {any} */ err) {
      throw Boom.badRequest(err)
    }

    let value = result.value

    if (!(result.value instanceof Uint8Array) && result.value.toJSON) {
      value = result.value.toJSON()
    }

    try {
      result.value = encodeBufferKeys(value, dataEncoding)
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err)
    }

    return h.response(result.value)
  }
}

export const putResource = {
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

        if (!request.headers['content-type']) {
          throw Boom.badRequest("File argument 'object data' is required")
        }

        let data

        for await (const part of multipartRequestParser(request.raw.req)) {
          if (part.type !== 'file') {
            continue
          }

          data = Buffer.concat(await all(part.content))
        }

        if (!data) {
          throw Boom.badRequest("File argument 'object data' is required")
        }

        return {
          data,
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
        storeCodec: Joi.string().default('dag-cbor'),
        inputCodec: Joi.string().default('dag-json'),
        pin: Joi.boolean().default(false),
        hash: Joi.string().default('sha2-256'),
        cidBase: Joi.string().default('base32'),
        version: Joi.number().integer().valid(0, 1).default(1),
        timeout: Joi.timeout()
      })
        .rename('store-codec', 'storeCodec', {
          override: true,
          ignoreUndefined: true
        })
        .rename('input-codec', 'inputCodec', {
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
          data,
          hashAlg
        }
      },
      query: {
        inputCodec,
        storeCodec,
        pin,
        cidBase,
        version,
        timeout
      }
    } = request

    const cidVersion = storeCodec === 'dag-pb' && hashAlg === 'sha2-256' ? version : 1

    let cid

    try {
      cid = await ipfs.dag.put(data, {
        inputCodec,
        storeCodec,
        hashAlg,
        version: cidVersion,
        pin,
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
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

export const resolveResource = {
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
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err)
    }
  }
}

export const exportResource = {
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

export const importResource = {
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
      multipartRequestParser(request.raw.req),
      async function * (source) {
        for await (const entry of source) {
          if (entry.type !== 'file') {
            throw Boom.badRequest('Unexpected upload type')
          }

          filesParsed = true
          yield entry.content
        }
      },
      async function * (source) {
        yield * ipfs.dag.import(source, {
          pinRoots,
          timeout,
          signal
        })
      },
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
