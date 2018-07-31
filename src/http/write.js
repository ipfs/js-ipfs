'use strict'

const Joi = require('joi')
const multipart = require('ipfs-multipart')
const once = require('once')

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

        reply = once(reply)

        parser.on('file', (_, fileStream) => {
          if (filesParsed) {
            return reply({
              Message: 'Please only send one file',
              Code: 0,
              Type: 'error'
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
            .then(() => reply())
            .catch(error => {
              reply({
                Message: error.message,
                Code: 0,
                Type: 'error'
              }).code(500).takeover()
            })
        })

        parser.on('error', (error) => {
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
          length: Joi.number().integer().min(0),
          create: Joi.boolean().default(false),
          truncate: Joi.boolean().default(false),
          rawLeaves: Joi.boolean().default(false),
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
        })
          .rename('o', 'offset', {
            override: true,
            ignoreUndefined: true
          })
          .rename('e', 'create', {
            override: true,
            ignoreUndefined: true
          })
          .rename('t', 'truncate', {
            override: true,
            ignoreUndefined: true
          })
      }
    }
  })
}

module.exports = mfsWrite
