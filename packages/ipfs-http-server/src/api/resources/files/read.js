import Joi from '../../../utils/joi.js'
import { streamResponse } from '../../../utils/stream-response.js'

export const readResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().required(),
        offset: Joi.number().integer().min(0),
        length: Joi.number().integer().min(0),
        timeout: Joi.timeout()
      })
        .rename('o', 'offset', {
          override: true,
          ignoreUndefined: true
        })
        .rename('n', 'length', {
          override: true,
          ignoreUndefined: true
        })
        .rename('count', 'length', {
          override: true,
          ignoreUndefined: true
        })
    }
  },

  /**
   * @param {import('../../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  handler (request, h) {
    const {
      ipfs
    } = request.server.app
    const {
      arg,
      offset,
      length,
      timeout
    } = request.query

    return streamResponse(request, h, () => ipfs.files.read(arg, {
      offset,
      length,
      signal: request.app.signal,
      timeout
    }))
  }
}
