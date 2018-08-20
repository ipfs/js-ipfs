'use strict'

const Joi = require('joi')
const {
  PassThrough
} = require('stream')

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

        const stream = ipfs.files.readReadableStream(arg, {
          offset,
          length
        })

        if (!stream._read) {
          // make the stream look like a Streams2 to appease Hapi
          stream._read = () => {}
          stream._readableState = {}
        }

        stream.once('data', (chunk) => {
          const passThrough = new PassThrough()

          reply(passThrough)
            .header('X-Stream-Output', '1')

          passThrough.write(chunk)
          stream.pipe(passThrough)
        })

        stream.once('error', (error) => {
          reply({
            Message: error.message,
            Code: error.code || 0,
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
