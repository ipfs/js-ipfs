import Joi from '../../utils/joi.js'

export const resolveResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        path: Joi.string().required(),
        recursive: Joi.boolean().default(true),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout()
      })
        .rename('arg', 'path', {
          override: true,
          ignoreUndefined: true
        })
        .rename('cid-base', 'cidBase', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
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
        path,
        recursive,
        cidBase,
        timeout
      }
    } = request

    const res = await ipfs.resolve(path, {
      recursive,
      cidBase,
      signal,
      timeout
    })

    return h.response({ Path: res })
  }
}
