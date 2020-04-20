'use strict'

const Joi = require('@hapi/joi')

module.exports = {
  validate: {
    options: {
      allowUnknown: true,
      stripUnknown: true
    },
    query: Joi.object().keys({
      arg: Joi.string().required(),
      format: Joi.string(),
      recursive: Joi.boolean().default(false)
    })
      .rename('r', 'recursive', {
        override: true,
        ignoreUndefined: true
      })
  },
  async handler (request, h) {
    const {
      arg,
      format,
      recursive
    } = request.query

    const path = await request.server.app.ipfs.dns(arg, {
      recursive,
      format
    })

    return h.response({
      Path: path
    })
  }
}
