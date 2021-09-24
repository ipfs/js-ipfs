import Joi from '../../../utils/joi.js'

export const flushResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        path: Joi.string().default('/'),
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
        path,
        cidBase,
        timeout
      }
    } = request

    const cid = await ipfs.files.flush(path, {
      signal,
      timeout
    })

    const base = await ipfs.bases.getBase(cidBase)

    return h.response({
      Cid: cid.toString(base.encoder)
    })
  }
}
