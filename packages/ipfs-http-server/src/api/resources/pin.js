import Joi from '../../utils/joi.js'
import Boom from '@hapi/boom'
import map from 'it-map'
import { pipe } from 'it-pipe'
import { streamResponse } from '../../utils/stream-response.js'
import all from 'it-all'
import reduce from 'it-reduce'

/**
 * @typedef {import('multiformats/cid').CID} CID
 */

/**
 * @param {string} type
 * @param {string} [cid]
 * @param {Record<string, any>} [metadata]
 */
function toPin (type, cid, metadata) {
  /** @type {{ Type: string, Cid?: string, Metadata?: Record<string, any> }} */
  const output = {
    Type: type
  }

  if (cid) {
    output.Cid = cid
  }

  if (metadata) {
    output.Metadata = metadata
  }

  return output
}

export const lsResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        paths: Joi.array().single().items(Joi.ipfsPath()),
        recursive: Joi.boolean().default(true),
        cidBase: Joi.string().default('base58btc'),
        type: Joi.string().valid('all', 'direct', 'indirect', 'recursive').default('all'),
        stream: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('cid-base', 'cidBase', {
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
        paths,
        type,
        cidBase,
        stream,
        timeout
      }
    } = request

    const source = ipfs.pin.ls({
      paths,
      type,
      signal,
      timeout
    })

    const base = await ipfs.bases.getBase(cidBase)

    if (!stream) {
      const res = await pipe(
        source,
        function collectKeys (source) {
          /** @type {{ Keys: Record<string, any> }} */
          const init = { Keys: {} }

          return reduce(source, (res, { type, cid, metadata }) => {
            res.Keys[cid.toString(base.encoder)] = toPin(type, undefined, metadata)

            return res
          }, init)
        }
      )

      return h.response(res)
    }

    return streamResponse(request, h, () => pipe(
      source,
      async function * transform (source) {
        yield * map(source, ({ type, cid, metadata }) => toPin(type, cid.toString(base.encoder), metadata))
      }
    ))
  }
}

export const addResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cids: Joi.array().single().items(Joi.cid()).min(1).required(),
        recursive: Joi.boolean().default(true),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout(),
        metadata: Joi.json()
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
        cids,
        recursive,
        cidBase,
        timeout,
        metadata
      }
    } = request

    let result
    try {
      result = await all(ipfs.pin.addAll(cids.map((/** @type {CID} */ cid) => ({ cid, recursive, metadata })), {
        signal,
        timeout
      }))
    } catch (/** @type {any} */ err) {
      if (err.code === 'ERR_BAD_PATH') {
        throw Boom.boomify(err, { statusCode: 400 })
      }

      if (err.message.includes('already pinned recursively')) {
        throw Boom.boomify(err, { statusCode: 400 })
      }

      throw Boom.boomify(err, { message: 'Failed to add pin' })
    }

    const base = await ipfs.bases.getBase(cidBase)

    return h.response({
      Pins: result.map(cid => cid.toString(base.encoder))
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
        recursive: Joi.boolean().default(true),
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
        cids,
        recursive,
        cidBase,
        timeout
      }
    } = request

    let result
    try {
      result = await all(ipfs.pin.rmAll(cids.map((/** @type {CID} */ cid) => ({ cid, recursive })), {
        signal,
        timeout
      }))
    } catch (/** @type {any} */ err) {
      if (err.code === 'ERR_BAD_PATH') {
        throw Boom.boomify(err, { statusCode: 400 })
      }

      throw Boom.boomify(err, { message: 'Failed to remove pin' })
    }

    const base = await ipfs.bases.getBase(cidBase)

    return h.response({
      Pins: result.map(cid => cid.toString(base.encoder))
    })
  }
}
