'use strict'

const Joi = require('@hapi/joi')

const mfsStat = {
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

    const output = {
      Type: stats.type,
      Blocks: stats.blocks,
      Size: stats.size,
      Hash: stats.cid.toString(cidBase),
      CumulativeSize: stats.cumulativeSize,
      WithLocality: stats.withLocality,
      Local: stats.local,
      SizeLocal: stats.sizeLocal
    }

    if (stats.mtime) {
      output.Mtime = stats.mtime.secs

      if (stats.mtime.nsecs) {
        output.MtimeNsecs = stats.mtime.nsecs
      }
    }

    if (stats.mode != null) {
      output.Mode = stats.mode.toString(8).padStart(4, '0')
    }

    return h.response(output)
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
