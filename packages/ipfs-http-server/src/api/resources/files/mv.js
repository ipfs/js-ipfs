import Joi from '../../../utils/joi.js'

export const mvResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.array().required().items(Joi.string()).min(2),
        recursive: Joi.boolean().default(false),
        parents: Joi.boolean().default(false),
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

  /**
   * @param {import('../../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  async handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      recursive,
      parents,
      hashAlg,
      cidVersion,
      flush,
      shardSplitThreshold,
      timeout
    } = request.query

    const args = arg.concat({
      recursive,
      parents,
      cidVersion,
      flush,
      hashAlg,
      shardSplitThreshold,
      signal: request.app.signal,
      timeout
    })

    await ipfs.files.mv.apply(null, args)

    return h.response()
  }
}
