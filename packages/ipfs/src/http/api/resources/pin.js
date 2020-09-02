'use strict'

const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const { map, reduce } = require('streaming-iterables')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const { cidToString } = require('../../../utils/cid')
const streamResponse = require('../../utils/stream-response')
const all = require('it-all')

function toPin (type, cid, metadata) {
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
        reduce((res, { type, cid, metadata }) => {
          res.Keys[cidToString(cid, { base: cidBase })] = toPin(type, metadata)
          return res
        }, { Keys: {} })
      )

      return h.response(res)
    }

    return streamResponse(request, h, () => pipe(
      source,
      map(({ type, cid, metadata }) => toPin(type, cidToString(cid, { base: cidBase }), metadata)),
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
      result = await all(ipfs.pin.addAll(cids.map(cid => ({ cid, recursive, metadata })), {
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
      result = await all(ipfs.pin.rmAll(cids.map(cid => ({ cid, recursive })), {
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
