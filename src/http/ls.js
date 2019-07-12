'use strict'

const Joi = require('@hapi/joi')
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

const mfsLs = {
  method: 'POST',
  path: '/api/v0/files/ls',
  async handler (request, h) {
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
      const responseStream = await new Promise((resolve, reject) => {
        const readableStream = ipfs.files.lsReadableStream(arg, {
          long,
          cidBase
        })

        let passThrough

        readableStream.on('data', (entry) => {
          if (!passThrough) {
            passThrough = new PassThrough()
            resolve(passThrough)
          }

          passThrough.write(JSON.stringify(mapEntry(entry)) + '\n')
        })

        readableStream.once('end', (entry) => {
          if (passThrough) {
            passThrough.end(entry ? JSON.stringify(mapEntry(entry)) + '\n' : undefined)
          }
        })

        readableStream.once('error', (error) => {
          reject(error)
        })
      })

      return h.response(responseStream).header('X-Stream-Output', '1')
    }

    const files = await ipfs.files.ls(arg, {
      long,
      cidBase
    })

    return h.response({
      Entries: files.map(mapEntry)
    })
  },
  options: {
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
}

module.exports = mfsLs
