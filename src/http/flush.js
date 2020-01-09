'use strict'

const Joi = require('@hapi/joi')

const {
  FILE_SEPARATOR
} = require('../core/utils/constants')

const mfsFlush = {
  method: 'POST',
  path: '/api/v0/files/flush',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg
    } = request.query

    await ipfs.files.flush(arg || FILE_SEPARATOR, {})

    return h.response()
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string()
      })
    }
  }
}

module.exports = mfsFlush
