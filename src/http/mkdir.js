'use strict'

const Joi = require('joi')

const mfsMkdir = (api) => {
  api.route({
    method: 'POST',
    path: '/api/v0/files/mkdir',
    config: {
      handler: (request, reply) => {
        const {
          ipfs
        } = request.server.app
        const {
          arg,
          parents,
          format,
          hashAlg,
          cidVersion,
          flush
        } = request.query

        return ipfs.files.mkdir(arg, {
          parents,
          format,
          hashAlg,
          cidVersion,
          flush
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
          parents: Joi.boolean().default(false),
          format: Joi.string().valid([
            'dag-pb',
            'dag-cbor'
          ]).default('dag-pb'),
          hashAlg: Joi.string().default('sha2-256'),
          cidVersion: Joi.number().integer().valid([
            0,
            1
          ]).default(0),
          flush: Joi.boolean().default(true)
        })
          .rename('p', 'parents', {
            override: true,
            ignoreUndefined: true
          })
      }
    }
  })
}

module.exports = mfsMkdir
