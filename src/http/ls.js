'use strict'

const Joi = require('joi')
const {
  PassThrough
} = require('stream')

const mapEntry = (entry) => {
  return {
    Name: entry.name,
    Type: entry.type,
    Size: entry.size,
    Hash: entry.hash
  }
}

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
          cidBase,
          stream
        } = request.query

        if (stream) {
          const readableStream = ipfs.files.lsReadableStream(arg, {
            long,
            cidBase
          })

          if (!readableStream._read) {
            // make the stream look like a Streams2 to appease Hapi
            readableStream._read = () => {}
            readableStream._readableState = {}
          }

          let passThrough

          readableStream.on('data', (entry) => {
            if (!passThrough) {
              passThrough = new PassThrough()

              reply(passThrough)
                .header('X-Stream-Output', '1')
            }

            passThrough.write(JSON.stringify(mapEntry(entry)) + '\n')
          })

          readableStream.once('end', (entry) => {
            if (passThrough) {
              passThrough.end(entry ? JSON.stringify(mapEntry(entry)) + '\n' : undefined)
            }
          })

          readableStream.once('error', (error) => {
            reply({
              Message: error.message,
              Code: error.code || 0,
              Type: 'error'
            }).code(500).takeover()
          })

          return
        }

        return ipfs.files.ls(arg, {
          long,
          cidBase
        })
          .then(files => {
            reply({
              Entries: files.map(mapEntry)
            })
          })
          .catch(error => {
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
          arg: Joi.string().default('/'),
          long: Joi.boolean().default(false),
          cidBase: Joi.string().default('base58btc'),
          stream: Joi.boolean().default(false)
        })
          .rename('l', 'long', {
            override: true,
            ignoreUndefined: true
          })
          .rename('s', 'stream', {
            override: true,
            ignoreUndefined: true
          })
      }
    }
  })
}

module.exports = mfsLs
