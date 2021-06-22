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

  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
        timeout
      }
    } = request

    const path = await ipfs.dns(domain, {
      recursive,
      signal,
      timeout
    })

    return h.response({
      Path: path
    })
  }
}
