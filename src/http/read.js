'use strict'

const Joi = require('@hapi/joi')
const {
  PassThrough
} = require('stream')

const mfsRead = {
  method: 'POST',
  path: '/api/v0/files/read',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      offset,
      length,
      count
    } = request.query

    const responseStream = await new Promise((resolve, reject) => {
      const stream = ipfs.files.readReadableStream(arg, {
        offset,
        length,
        count
      })

      stream.once('data', (chunk) => {
        const passThrough = new PassThrough()

        resolve(passThrough)

        passThrough.write(chunk)
        stream.pipe(passThrough)
      })

      stream.once('error', (error) => {
        reject(error)
      })
    })

    return h.response(responseStream).header('X-Stream-Output', '1')
  },
  options: {
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
}

module.exports = mfsRead
