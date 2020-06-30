'use strict'

const Joi = require('../../../utils/joi')
const streamResponse = require('../../../utils/stream-response')

const mfsRead = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().required(),
        offset: Joi.number().integer().min(0),
        length: Joi.number().integer().min(0),
        timeout: Joi.timeout()
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
  },
  handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      offset,
      length,
      timeout
    } = request.query

    return streamResponse(request, h, () => ipfs.files.read(arg, {
      offset,
      length,
      signal: request.app.signal,
      timeout
    }))
  }
}

module.exports = mfsRead
