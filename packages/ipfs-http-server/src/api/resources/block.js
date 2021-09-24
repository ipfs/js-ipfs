import { multipartRequestParser } from '../../utils/multipart-request-parser.js'
import Joi from '../../utils/joi.js'
import Boom from '@hapi/boom'
import all from 'it-all'
import { pipe } from 'it-pipe'
import map from 'it-map'
import { streamResponse } from '../../utils/stream-response.js'

export const getResource = {
  options: {
    payload: {
      parse: false,
      output: 'stream'
    },
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'cid', {
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
        cid,
        timeout
      }
    } = request

    let block
    try {
      block = await ipfs.block.get(cid, {
        timeout,
        signal
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to get block' })
    }

    if (!block) {
      throw Boom.notFound('Block was unwanted before it could be remotely retrieved')
    }

    return h.response(Buffer.from(block.buffer, block.byteOffset, block.byteLength)).header('X-Stream-Output', '1')
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
          throw Boom.badRequest("File argument 'data' is required")
        }

        let data

        for await (const part of multipartRequestParser(request.raw.req)) {
          if (part.type !== 'file') {
            continue
          }

          data = Buffer.concat(await all(part.content))
        }

        if (!data) {
          throw Boom.badRequest("File argument 'data' is required")
        }

        return { data }
      }
    }],
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cidBase: Joi.string().default('base32'),
        format: Joi.string().default('dag-pb'),
        mhtype: Joi.string().default('sha2-256'),
        mhlen: Joi.number(),
        pin: Joi.bool().default(false),
        version: Joi.number().default(0),
        timeout: Joi.timeout()
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
      pre: {
        args: {
          data
        }
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        mhtype,
        format,
        version,
        pin,
        timeout,
        cidBase
      }
    } = request

    const codec = format === 'v0' ? 'dag-pb' : format
    const cidVersion = codec === 'dag-pb' && mhtype === 'sha2-256' ? version : 1
    let cid

    try {
      cid = await ipfs.block.put(data, {
        mhtype,
        format: codec,
        version: cidVersion,
        pin,
        signal,
        timeout
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to put block' })
    }

    const base = await ipfs.bases.getBase(cidVersion === 0 ? 'base58btc' : cidBase)

    return h.response({
      Key: cid.toString(base.encoder),
      Size: data.length
    })
  }
}

export const rmResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cids: Joi.array().single().items(Joi.cid()).min(1).required(),
        force: Joi.boolean().default(false),
        quiet: Joi.boolean().default(false),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'cids', {
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
        cids,
        force,
        quiet,
        timeout,
        cidBase
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.block.rm(cids, {
        force,
        quiet,
        timeout,
        signal
      }),
      async function * (source) {
        const base = await ipfs.bases.getBase(cidBase)

        yield * map(source, ({ cid, error }) => ({ Hash: cid.toString(base.encoder), Error: error ? error.message : undefined }))
      }
    ))
  }
}

export const statResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout()
      })
        .rename('arg', 'cid', {
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
        cid,
        cidBase,
        timeout
      }
    } = request

    let stats
    try {
      stats = await ipfs.block.stat(cid, {
        timeout,
        signal
      })
    } catch (/** @type {any} */ err) {
      throw Boom.boomify(err, { message: 'Failed to get block stats' })
    }

    const base = await ipfs.bases.getBase(cidBase)

    return h.response({
      Key: stats.cid.toString(base.encoder),
      Size: stats.size
    })
  }
}
