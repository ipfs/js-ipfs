'use strict'

const Joi = require('@hapi/joi')

const mfsCp = {
  method: 'POST',
  path: '/api/v0/files/cp',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      parents,
      format,
      hashAlg,
      shardSplitThreshold
    } = request.query

    const args = arg.concat({
      parents,
      format,
      hashAlg,
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
        format: Joi.string().valid([
          'dag-pb',
          'dag-cbor'
        ]).default('dag-pb'),
        hashAlg: Joi.string().default('sha2-256')
      })
    }
  }
}

module.exports = mfsCp
