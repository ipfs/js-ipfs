'use strict'

const Joi = require('../../utils/joi')

module.exports = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        domain: Joi.string().required(),
        format: Joi.string(),
        recursive: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('r', 'recursive', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'domain', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        domain,
        recursive,
        format,
        timeout
      }
    } = request

    const path = await ipfs.dns(domain, {
      recursive,
      format,
      signal,
      timeout
    })

    return h.response({
      Path: path
    })
  }
}
