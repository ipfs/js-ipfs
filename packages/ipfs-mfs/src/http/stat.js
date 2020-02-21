'use strict'

const Joi = require('@hapi/joi')

const mfsStat = {
  method: 'POST',
  path: '/api/v0/files/stat',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      hash,
      size,
      withLocal,
      cidBase
    } = request.query

    const stats = await ipfs.files.stat(arg, {
      hash,
      size,
      withLocal
    })

    return h.response({
      Type: stats.type,
      Blocks: stats.blocks,
      Size: stats.size,
      Hash: stats.cid.toString(cidBase),
      CumulativeSize: stats.cumulativeSize,
      WithLocality: stats.withLocality,
      Local: stats.local,
      SizeLocal: stats.sizeLocal,
      Mtime: stats.mtime ? stats.mtime.secs : undefined,
      MtimeNsecs: stats.mtime ? stats.mtime.nsecs : undefined,
      Mode: stats.mode.toString(8).padStart(4, '0')
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
        hash: Joi.boolean().default(false),
        size: Joi.boolean().default(false),
        withLocal: Joi.boolean().default(false),
        cidBase: Joi.string()
      })
    }
  }
}

module.exports = mfsStat
