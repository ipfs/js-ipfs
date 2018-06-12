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
          l
        } = request.query

        return ipfs.files.ls(arg, {
          long: long || l
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
      },
      validate: {
        options: {
          allowUnknown: true,
          stripUnknown: true
        },
        query: {
          arg: Joi.string().default('/'),
          long: Joi.boolean().default(false),
          l: Joi.boolean().default(false)
        }
      }
    }
  })
}

module.exports = mfsLs
