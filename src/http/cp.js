'use strict'

const Joi = require('joi')

const mfsCp = (api) => {
  api.route({
    method: 'POST',
    path: '/api/v0/files/cp',
    config: {
      handler: (request, reply) => {
        const {
          ipfs
        } = request.server.app
        const {
          arg,
          parents,
          format,
          hashAlg
        } = request.query

        const args = arg.concat({
          parents,
          format,
          hashAlg
        })

        return ipfs.files.cp.apply(null, args)
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
          arg: Joi.array().items(Joi.string()).min(2),
          parents: Joi.boolean().default(false),
          format: Joi.string().valid([
            'dag-pb',
            'dag-cbor'
          ]).default('dag-pb'),
          hashAlg: Joi.string().default('sha2-256')
        })
      }
    }
  })
}

module.exports = mfsCp
