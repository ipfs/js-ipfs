'use strict'

const Joi = require('joi')

const mfsRm = (api) => {
  api.route({
    method: 'POST',
    path: '/api/v0/files/rm',
    config: {
      handler: (request, reply) => {
        const {
          ipfs
        } = request.server.app
        const {
          arg,
          recursive
        } = request.query

        return ipfs.files.rm(arg, {
          recursive
        })
          .then(() => reply())
          .catch(error => {
            reply({
              Message: error.message,
              Code: 0,
              Type: 'error'
            }).code(500).takeover()
          })
      },
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
  })
}

module.exports = mfsRm
