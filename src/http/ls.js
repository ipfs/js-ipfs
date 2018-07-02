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
          long
        } = request.query

        return ipfs.files.ls(arg, {
          long
        })
          .then(files => {
            reply({
              Entries: files.map(file => {
                const output = {
                  Name: file.name,
                  Type: file.type
                }

                if (long) {
                  output.Size = file.size
                  output.Hash = file.hash
                }
              })
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
          long: Joi.boolean().default(false)
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
