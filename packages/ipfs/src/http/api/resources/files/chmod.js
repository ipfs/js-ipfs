'use strict'

const Joi = require('@hapi/joi')

const mfsChmod = {
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      mode,
      recursive,
      hashAlg,
      flush,
      shardSplitThreshold
    } = request.query

    await ipfs.files.chmod(arg, mode, {
      recursive,
      hashAlg,
      flush,
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
        arg: Joi.string(),
        mode: Joi.string(),
        recursive: Joi.boolean().default(false),
        flush: Joi.boolean().default(true),
        hashAlg: Joi.string().default('sha2-256'),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000)
      })
        .rename('shard-split-threshold', 'shardSplitThreshold', {
          override: true,
          ignoreUndefined: true
        })
        .rename('hash-alg', 'hashAlg', {
          override: true,
          ignoreUndefined: true
        })
        .rename('hash', 'hashAlg', {
          override: true,
          ignoreUndefined: true
        })
    }
  }
}

module.exports = mfsChmod
