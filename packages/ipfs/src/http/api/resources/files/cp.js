'use strict'

const Joi = require('@hapi/joi')

const mfsCp = {
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      parents,
      flush,
      hashAlg,
      cidVersion,
      shardSplitThreshold
    } = request.query

    const args = arg.concat({
      parents,
      flush,
      hashAlg,
      cidVersion,
      shardSplitThreshold
    })

    await ipfs.files.cp.apply(null, args)

    return h.response()
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.array().items(Joi.string()).min(2),
        parents: Joi.boolean().default(false),
        flush: Joi.boolean().default(true),
        hashAlg: Joi.string().default('sha2-256'),
        cidVersion: Joi.number().integer().valid([
          0,
          1
        ]).default(0),
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
        .rename('cid-version', 'cidVersion', {
          override: true,
          ignoreUndefined: true
        })
    }
  }
}

module.exports = mfsCp
