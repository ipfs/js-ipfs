import Joi from '../../../utils/joi.js'

export const rmResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.array().required().items(Joi.string()).min(1).single(),
        recursive: Joi.boolean().default(false),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000),
        timeout: Joi.timeout()
      })
        .rename('r', 'recursive', {
          override: true,
          ignoreUndefined: true
        })
        .rename('shard-split-threshold', 'shardSplitThreshold', {
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
      server: {
        app: {
          ipfs
        }
      },
      query: {
        arg,
        recursive,
        shardSplitThreshold,
        timeout
      },
      app: {
        signal
      }
    } = request

    await ipfs.files.rm(arg, {
      recursive,
      shardSplitThreshold,
      signal,
      timeout
    })

    return h.response()
  }
}
