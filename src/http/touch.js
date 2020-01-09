'use strict'

const Joi = require('@hapi/joi')
const parseMtime = require('./utils/parse-mtime')

const mfsTouch = {
  method: 'POST',
  path: '/api/v0/files/touch',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      flush,
      shardSplitThreshold,
      cidVersion,
      hashAlg,
      mtime,
      mtimeNsecs
    } = request.query

    await ipfs.files.touch(arg, {
      mtime: parseMtime(mtime, mtimeNsecs),
      flush,
      shardSplitThreshold,
      cidVersion,
      hashAlg
    })

    return h.response()
  },
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().required(),
        mtime: Joi.number().integer(),
        mtimeNsecs: Joi.number().integer().min(0),
        hashAlg: Joi.string().default('sha2-256'),
        cidVersion: Joi.number().integer().valid([
          0,
          1
        ]).default(0),
        flush: Joi.boolean().default(true),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000)
      })
    }
  }
}

module.exports = mfsTouch
