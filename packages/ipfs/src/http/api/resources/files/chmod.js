'use strict'

const Joi = require('../../../utils/joi')

const mfsChmod = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        path: Joi.string(),
        mode: Joi.string(),
        recursive: Joi.boolean().default(false),
        flush: Joi.boolean().default(true),
        hashAlg: Joi.string().default('sha2-256'),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000),
        timeout: Joi.timeout()
      })
        .rename('arg', 'path', {
          override: true,
          ignoreUndefined: true
        })
        .rename('shard-split-threshold', 'shardSplitThreshold', {
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
    }
  },
  async handler (request, h) {
    const {
      app: {
        signal
      },
      server: {
        app: {
          ipfs
        }
      },
      query: {
        path,
        mode,
        recursive,
        hashAlg,
        flush,
        shardSplitThreshold,
        timeout
      }
    } = request

    await ipfs.files.chmod(path, mode, {
      recursive,
      hashAlg,
      flush,
      shardSplitThreshold,
      signal,
      timeout
    })

    return h.response()
  }
}

module.exports = mfsChmod
