import Joi from '../../../utils/joi.js'

export const statResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().default('/'),
        hash: Joi.boolean().default(false),
        size: Joi.boolean().default(false),
        withLocal: Joi.boolean().default(false),
        cidBase: Joi.string().default('base58btc'),
        timeout: Joi.timeout()
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
      hash,
      size,
      withLocal,
      cidBase,
      timeout
    } = request.query

    const stats = await ipfs.files.stat(arg, {
      hash,
      size,
      withLocal,
      signal: request.app.signal,
      timeout
    })

    const base = await ipfs.bases.getBase(cidBase)

    const output = {
      Type: stats.type,
      Blocks: stats.blocks,
      Size: stats.size,
      Hash: stats.cid.toString(base.encoder),
      CumulativeSize: stats.cumulativeSize,
      WithLocality: stats.withLocality,
      Local: stats.local,
      SizeLocal: stats.sizeLocal,
      Mtime: stats.mtime ? stats.mtime.secs : undefined,
      MtimeNsecs: stats.mtime ? stats.mtime.nsecs : undefined,
      Mode: stats.mode != null ? stats.mode.toString(8).padStart(4, '0') : undefined
    }

    return h.response(output)
  }
}
