'use strict'

const Joi = require('../../../utils/joi')
const parseMtime = require('./utils/parse-mtime')

const mfsTouch = {
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
        cidVersion: Joi.number().integer().valid(0, 1).default(0),
        flush: Joi.boolean().default(true),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000),
        timeout: Joi.timeout()
      })
        .rename('shard-split-threshold', 'shardSplitThreshold', {
          override: true,
          ignoreUndefined: true
        })
        .rename('mtime-nsecs', 'mtimeNsecs', {
          override: true,
          ignoreUndefined: true
        })
        .rename('hash-alg', 'hashAlg', {
          override: true,
          ignoreUndefined: true
        })
        .rename('hash', 'hashAlg', {
          override: true,
          ignoreUndefined: true
        })
        .rename('cid-version', 'cidVersion', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
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
      mtimeNsecs,
      timeout
    } = request.query

    await ipfs.files.touch(arg, {
      mtime: parseMtime(mtime, mtimeNsecs),
      flush,
      shardSplitThreshold,
      cidVersion,
      hashAlg,
      signal: request.app.signal,
      timeout
    })

    return h.response()
  }
}

module.exports = mfsTouch
