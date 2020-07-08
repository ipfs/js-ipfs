'use strict'

const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const { map, reduce } = require('streaming-iterables')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const { cidToString } = require('../../../utils/cid')
const streamResponse = require('../../utils/stream-response')

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
        reduce((res, { type, cid }) => {
          res.Keys[cidToString(cid, { base: cidBase })] = { Type: type }
          return res
        }, { Keys: {} })
      )

      return h.response(res)
    }

    return streamResponse(request, h, () => pipe(
      source,
      map(({ type, cid }) => ({ Type: type, Cid: cidToString(cid, { base: cidBase }) })),
      ndjson.stringify
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
      result = await ipfs.pin.add(cids, {
        recursive,
        signal,
        timeout
      })
    } catch (err) {
      if (err.message.includes('already pinned recursively')) {
        throw Boom.boomify(err, { statusCode: 400 })
      }
      throw Boom.boomify(err, { message: 'Failed to add pin' })
    }

    return h.response({
      Pins: result.map(obj => cidToString(obj.cid, { base: cidBase }))
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
      result = await ipfs.pin.rm(cids, {
        recursive,
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to remove pin' })
    }

    return h.response({
      Pins: result.map(obj => cidToString(obj.cid, { base: cidBase }))
    })
  }
}
