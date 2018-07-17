'use strict'

const Joi = require('joi')

const mfsLs = (api) => {
  api.route({
    method: 'POST',
    path: '/api/v0/files/ls',
    config: {
      handler: (request, reply) => {
        const {
          ipfs
        } = request.server.app
        const {
          arg,
          long,
          cidBase
        } = request.query

        return ipfs.files.ls(arg, {
          long,
          cidBase
        })
          .then(files => {
            reply({
              Entries: files.map(file => ({
                Name: file.name,
                Type: file.type,
                Size: file.size,
                Hash: file.hash
              }))
            })
          })
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
          arg: Joi.string().default('/'),
          long: Joi.boolean().default(false),
          cidBase: Joi.string().default('base58btc')
        })
          .rename('l', 'long', {
            override: true,
            ignoreUndefined: true
          })
      }
    }
  })
}

module.exports = mfsLs
