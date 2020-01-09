'use strict'

const Joi = require('@hapi/joi')
const {
  PassThrough
} = require('stream')

const mapEntry = (entry) => {
  const output = {
    Name: entry.name,
    Type: entry.type,
    Size: entry.size,
    Hash: entry.hash,
    Mode: entry.mode.toString(8).padStart(4, '0')
  }

  if (entry.mtime) {
    output.Mtime = entry.mtime.secs

    if (entry.mtime.nsecs != null) {
      output.MtimeNsecs = entry.mtime.nsecs
    }
  }

  return output
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

        const passThrough = new PassThrough()

        readableStream.on('data', (entry) => {
          resolve(passThrough)
          passThrough.write(JSON.stringify(mapEntry(entry)) + '\n')
        })

        readableStream.once('end', (entry) => {
          resolve(passThrough)
          passThrough.end(entry ? JSON.stringify(mapEntry(entry)) + '\n' : undefined)
        })

        readableStream.once('error', (err) => {
          passThrough.end()
          reject(err)
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
