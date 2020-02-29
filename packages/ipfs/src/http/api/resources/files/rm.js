'use strict'

const Joi = require('@hapi/joi')

const mfsRm = {

  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      recursive,
      shardSplitThreshold
    } = request.query

    await ipfs.files.rm(arg, {
      recursive,
      shardSplitThreshold
    })

    return h.response()
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().required(),
        recursive: Joi.boolean().default(false),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000)
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
  }
}

module.exports = mfsRm
