'use strict'

const Joi = require('joi')
const multipart = require('ipfs-multipart')

const mfsWrite = (api) => {
  api.route({
    method: 'POST',
    path: '/api/v0/files/write',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      handler: (request, reply) => {
        const {
          ipfs
        } = request.server.app
        const {
          arg,
          offset,
          length,
          create,
          truncate,
          rawLeaves,
          cidVersion,
          hashAlg,
          format,
          parents,
          progress,
          strategy,
          flush
        } = request.query

        const parser = multipart.reqParser(request.payload)
        let filesParsed = false

        parser.on('file', (_, fileStream) => {
          if (filesParsed) {
            return reply({
              Message: 'Please only send one file',
              code: 0
            }).code(400).takeover()
          }

          filesParsed = true

          ipfs.files.write(arg, fileStream, {
            offset,
            length,
            create,
            truncate,
            rawLeaves,
            cidVersion,
            hashAlg,
            format,
            parents,
            progress,
            strategy,
            flush
          })
            .catch(error => {
              reply({
                Message: error.message,
                code: 0
              }).code(500).takeover()
            })
        })

        parser.on('error', () => {
          return reply({
            Message: "File argument 'data' is required.",
            code: 0
          }).code(400).takeover()
        })

        parser.on('end', () => {
          if (!filesParsed) {
            return reply({
              Message: "File argument 'data' is required.",
              code: 0
            }).code(400).takeover()
          }

          reply()
        })
      },
      validate: {
        options: {
          allowUnknown: true,
          stripUnknown: true
        },
        query: {
          arg: Joi.string().required(),
          offset: Joi.number().integer().min(0),
          length: Joi.number().integer().min(0),
          create: Joi.boolean().default(false),
          truncate: Joi.boolean().default(false),
          rawLeaves: Joi.boolean().default(true),
          cidVersion: Joi.number().integer().valid([
            0,
            1
          ]).default(0),
          hashAlg: Joi.string().valid([
            'sha2-256'
          ]).default('sha2-256'),
          format: Joi.string().valid([
            'dag-pb',
            'dag-cbor'
          ]).default('dag-pb'),
          parents: Joi.boolean().default(false),
          progress: Joi.func(),
          strategy: Joi.string().valid([
            'flat',
            'balanced',
            'trickle'
          ]).default('trickle'),
          flush: Joi.boolean().default(true)
        }
      }
    }
  })
}

module.exports = mfsWrite
