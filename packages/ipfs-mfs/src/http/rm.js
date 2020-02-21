'use strict'

const Joi = require('@hapi/joi')

const mfsRm = {
  method: 'POST',
  path: '/api/v0/files/rm',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      recursive
    } = request.query

    await ipfs.files.rm(arg, {
      recursive
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
        recursive: Joi.boolean().default(false)
      })
        .rename('r', 'recursive', {
          override: true,
          ignoreUndefined: true
        })
    }
  }
}

module.exports = mfsRm
