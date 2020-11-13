'use strict'

const Joi = require('../../../utils/joi')

const mfsRm = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.array().required().items(Joi.string()).min(1).single(),
        recursive: Joi.boolean().default(false),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000),
        timeout: Joi.timeout()
      })
        .rename('r', 'recursive', {
          override: true,
          ignoreUndefined: true
        })
        .rename('shard-split-threshold', 'shardSplitThreshold', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      recursive,
      shardSplitThreshold,
      timeout
    } = request.query

    const args = [...arg, {
      recursive,
      shardSplitThreshold,
      signal: request.app.signal,
      timeout
    }]

    await ipfs.files.rm.apply(null, args)

    return h.response()
  }
}

module.exports = mfsRm
