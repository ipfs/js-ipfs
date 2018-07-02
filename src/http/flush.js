'use strict'

const Joi = require('joi')

const mfsFlush = (api) => {
  api.route({
    method: 'POST',
    path: '/api/v0/files/flush',
    config: {
      handler: (request, reply) => {
        const {
          ipfs
        } = request.server.app
        const {
          arg
        } = request.query

        return ipfs.files.flush.call(null, arg)
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
          arg: Joi.string().required()
        })
      }
    }
  })
}

module.exports = mfsFlush
