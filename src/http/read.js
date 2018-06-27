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
          .rename('o', 'offset')
          .rename('n', 'length')
      }
    }
  })
}

module.exports = mfsRead
