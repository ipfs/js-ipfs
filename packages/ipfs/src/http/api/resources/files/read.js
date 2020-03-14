'use strict'

const Joi = require('@hapi/joi')
const streamResponse = require('../../../utils/stream-response')

const mfsRead = {
  handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      offset,
      length
    } = request.query

    return streamResponse(request, h, () => ipfs.files.read(arg, {
      offset,
      length
    }))
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().required(),
        offset: Joi.number().integer().min(0),
        length: Joi.number().integer().min(0)
      })
        .rename('o', 'offset', {
          override: true,
          ignoreUndefined: true
        })
        .rename('n', 'length', {
          override: true,
          ignoreUndefined: true
        })
        .rename('count', 'length', {
          override: true,
          ignoreUndefined: true
        })
    }
  }
}

module.exports = mfsRead
