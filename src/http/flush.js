'use strict'

const Joi = require('@hapi/joi')

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

    await ipfs.files.flush.call(null, arg)

    return h.response()
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().required()
      })
    }
  }
}

module.exports = mfsFlush
