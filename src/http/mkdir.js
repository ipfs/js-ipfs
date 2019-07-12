'use strict'

const Joi = require('@hapi/joi')

const mfsMkdir = {
  method: 'POST',
  path: '/api/v0/files/mkdir',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      parents,
      format,
      hashAlg,
      cidVersion,
      flush,
      shardSplitThreshold
    } = request.query

    await ipfs.files.mkdir(arg, {
      parents,
      format,
      hashAlg,
      cidVersion,
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
        arg: Joi.string().required(),
        parents: Joi.boolean().default(false),
        format: Joi.string().valid([
          'dag-pb',
          'dag-cbor'
        ]).default('dag-pb'),
        hashAlg: Joi.string().default('sha2-256'),
        cidVersion: Joi.number().integer().valid([
          0,
          1
        ]).default(0),
        flush: Joi.boolean().default(true)
      })
        .rename('p', 'parents', {
          override: true,
          ignoreUndefined: true
        })
    }
  }
}

module.exports = mfsMkdir
