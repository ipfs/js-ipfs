'use strict'

const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const map = require('it-map')
const reduce = require('it-reduce')
const { pipe } = require('it-pipe')
const { cidToString } = require('ipfs-core-utils/src/cid')
const streamResponse = require('../../utils/stream-response')
const all = require('it-all')

/**
 * @typedef {import('cids')} CID
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

exports.ls = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        paths: Joi.array().single().items(Joi.ipfsPath()),
        recursive: Joi.boolean().default(true),
        cidBase: Joi.cidBase(),
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

    if (!stream) {
      const res = await pipe(
        source,
        function collectKeys (source) {
          /** @type {{ Keys: Record<string, any> }} */
          const init = { Keys: {} }

          return reduce(source, (res, { type, cid, metadata }) => {
            res.Keys[cidToString(cid, { base: cidBase })] = toPin(type, undefined, metadata)

            return res
          }, init)
        }
      )

      return h.response(res)
    }

    return streamResponse(request, h, () => pipe(
      source,
      async function * transform (source) {
        yield * map(source, ({ type, cid, metadata }) => toPin(type, cidToString(cid, { base: cidBase }), metadata))
      }
    ))
  }
}

exports.add = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cids: Joi.array().single().items(Joi.cid()).min(1).required(),
        recursive: Joi.boolean().default(true),
        cidBase: Joi.cidBase(),
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
    } catch (err) {
      if (err.code === 'ERR_BAD_PATH') {
        throw Boom.boomify(err, { statusCode: 400 })
      }

      if (err.message.includes('already pinned recursively')) {
        throw Boom.boomify(err, { statusCode: 400 })
      }

      throw Boom.boomify(err, { message: 'Failed to add pin' })
    }

    return h.response({
      Pins: result.map(cid => cidToString(cid, { base: cidBase }))
    })
  }
}

exports.rm = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cids: Joi.array().single().items(Joi.cid()).min(1).required(),
        recursive: Joi.boolean().default(true),
        cidBase: Joi.cidBase(),
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
    } catch (err) {
      if (err.code === 'ERR_BAD_PATH') {
        throw Boom.boomify(err, { statusCode: 400 })
      }

      throw Boom.boomify(err, { message: 'Failed to remove pin' })
    }

    return h.response({
      Pins: result.map(cid => cidToString(cid, { base: cidBase }))
    })
  }
}
