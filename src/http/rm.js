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
      },
      validate: {
        options: {
          allowUnknown: true,
          stripUnknown: true
        },
        query: {
          arg: Joi.string().required(),
          recursive: Joi.boolean().default(false)
        }
      }
    }
  })
}

module.exports = mfsRm
