'use strict'

const Joi = require('@hapi/joi')

const mfsMv = {
  method: 'POST',
  path: '/api/v0/files/mv',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      recursive,
      parents,
      hashAlg,
      cidVersion,
      flush,
      shardSplitThreshold
    } = request.query

    const args = arg.concat({
      recursive,
      parents,
      cidVersion,
      flush,
      hashAlg,
      shardSplitThreshold
    })

    await ipfs.files.mv.apply(null, args)

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
        recursive: Joi.boolean().default(false),
        parents: Joi.boolean().default(false),
        hashAlg: Joi.string().default('sha2-256'),
        cidVersion: Joi.number().integer().valid([
          0,
          1
        ]).default(0),
        flush: Joi.boolean().default(true),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000)
      })
    }
  }
}

module.exports = mfsMv
