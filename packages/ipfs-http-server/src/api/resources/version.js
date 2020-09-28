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
        timeout: Joi.timeout()
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
        timeout
      }
    } = request

    const version = await ipfs.version({
      signal,
      timeout
    })

    return h.response({
      Version: version.version,
      Commit: version.commit,
      Repo: version.repo,
      'ipfs-http-client': version['ipfs-http-client'],
      'interface-ipfs-core': version['interface-ipfs-core']
    })
  }
}
