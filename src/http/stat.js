'use strict'

const Joi = require('@hapi/joi')

const mfsStat = {
  method: 'POST',
  path: '/api/v0/files/stat',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      hash,
      size,
      withLocal,
      cidBase
    } = request.query

    const stats = await ipfs.files.stat(arg, {
      hash,
      size,
      withLocal,
      cidBase
    })

    return h.response({
      Type: stats.type,
      Blocks: stats.blocks,
      Size: stats.size,
      Hash: stats.hash,
      CumulativeSize: stats.cumulativeSize,
      WithLocality: stats.withLocality,
      Local: stats.local,
      SizeLocal: stats.sizeLocal
    })
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().default('/'),
        hash: Joi.boolean().default(false),
        size: Joi.boolean().default(false),
        withLocal: Joi.boolean().default(false),
        cidBase: Joi.string().default('base58btc')
      })
    }
  }
}

module.exports = mfsStat
