'use strict'

const Joi = require('@hapi/joi')
const parseMtime = require('./utils/parse-mtime')

const mfsMkdir = {
  method: 'POST',
  path: '/api/v0/files/mkdir',
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      mode,
      mtime,
      mtimeNsecs,
      parents,
      hashAlg,
      cidVersion,
      flush,
      shardSplitThreshold
    } = request.query

    await ipfs.files.mkdir(arg, {
      mode,
      mtime: parseMtime(mtime, mtimeNsecs),
      parents,
      hashAlg,
      cidVersion,
      flush,
      shardSplitThreshold
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
        mode: Joi.string(),
        mtime: Joi.number().integer(),
        mtimeNsecs: Joi.number().integer().min(0),
        parents: Joi.boolean().default(false),
        hashAlg: Joi.string().default('sha2-256'),
        cidVersion: Joi.number().integer().valid([
          0,
          1
        ]).default(0),
        flush: Joi.boolean().default(true),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000)
      })
        .rename('p', 'parents', {
          override: true,
          ignoreUndefined: true
        })
    }
  }
}

module.exports = mfsMkdir
