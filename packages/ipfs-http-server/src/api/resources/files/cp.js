import Joi from '../../../utils/joi.js'

export const cpResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        paths: Joi.array().required().items(Joi.string()).min(2),
        parents: Joi.boolean().default(false),
        flush: Joi.boolean().default(true),
        hashAlg: Joi.string().default('sha2-256'),
        cidVersion: Joi.number().integer().valid(0, 1).default(0),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000),
        timeout: Joi.timeout()
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
        .rename('cid-version', 'cidVersion', {
          override: true,
          ignoreUndefined: true
        })
        .rename('arg', 'paths', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  /**
   * @param {import('../../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
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
        paths,
        parents,
        flush,
        hashAlg,
        cidVersion,
        shardSplitThreshold,
        timeout
      }
    } = request

    const dest = paths.pop()

    await ipfs.files.cp(paths, dest, {
      parents,
      flush,
      hashAlg,
      cidVersion,
      shardSplitThreshold,
      signal,
      timeout
    })

    return h.response()
  }
}
