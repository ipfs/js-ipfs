'use strict'

const Joi = require('joi')

const mfsRead = (api) => {
  api.route({
    method: 'POST',
    path: '/api/v0/files/read',
    config: {
      handler: (request, reply) => {
        const {
          ipfs
        } = request.server.app
        const {
          arg,
          offset,
          length
        } = request.query

        return ipfs.files.readReadableStream(arg, {
          offset,
          length
        })
          .then(stream => {
            if (!stream._read) {
              // make the stream look like a Streams2 to appease Hapi
              stream._read = () => {}
              stream._readableState = {}
            }

            reply(stream).header('X-Stream-Output', '1')
          })
          .catch(error => {
            if (error.message.includes('did not exist')) {
              error.message = 'file does not exist'
            }

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
          offset: Joi.number().integer().min(0),
          length: Joi.number().integer().min(0)
        })
          .rename('o', 'offset', {
            override: true,
            ignoreUndefined: true
          })
          .rename('n', 'length', {
            override: true,
            ignoreUndefined: true
          })
      }
    }
  })
}

module.exports = mfsRead
