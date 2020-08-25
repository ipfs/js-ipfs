'use strict'

const multihash = require('multihashing-async').multihash
const codecs = require('multicodec/src/base-table.json')
const multipart = require('../../utils/multipart-request-parser')
const Joi = require('../../utils/joi')
const Boom = require('@hapi/boom')
const { cidToString } = require('../../../utils/cid')
const debug = require('debug')
const all = require('it-all')
const pipe = require('it-pipe')
const { map } = require('streaming-iterables')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')
const log = debug('ipfs:http-api:block')
log.error = debug('ipfs:http-api:block:error')

exports.get = {
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

  // main route handler which is called after the above `parseArgs`, but only if the args were valid
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
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get block' })
    }

    if (!block) {
      throw Boom.notFound('Block was unwanted before it could be remotely retrieved')
    }

    return h.response(block.data).header('X-Stream-Output', '1')
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
      method: async (request, h) => {
        if (!request.payload) {
          throw Boom.badRequest("File argument 'data' is required")
        }

        let data

        for await (const part of multipart(request)) {
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
        cidBase: Joi.cidBase(),
        format: Joi.string().valid(...Object.keys(codecs)),
        mhtype: Joi.string().valid(...Object.keys(multihash.names)),
        mhlen: Joi.number(),
        pin: Joi.bool().default(false),
        version: Joi.number(),
        timeout: Joi.timeout()
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
        mhlen,
        format,
        version,
        pin,
        timeout,
        cidBase
      }
    } = request

    let block
    try {
      block = await ipfs.block.put(data, {
        mhtype,
        mhlen,
        format,
        version,
        pin,
        signal,
        timeout
      })
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to put block' })
    }

    return h.response({
      Key: cidToString(block.cid, { base: cidBase }),
      Size: block.data.length
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
        force: Joi.boolean().default(false),
        quiet: Joi.boolean().default(false),
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
      map(({ cid, error }) => ({ Hash: cidToString(cid, { base: cidBase }), Error: error ? error.message : undefined })),
      ndjson.stringify
    ))
  }
}

exports.stat = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        cid: Joi.cid().required(),
        cidBase: Joi.cidBase(),
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
  // main route handler which is called after the above `parseArgs`, but only if the args were valid
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
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get block stats' })
    }

    return h.response({
      Key: cidToString(stats.cid, { base: cidBase }),
      Size: stats.size
    })
  }
}
