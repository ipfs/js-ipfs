import Joi from '../../../utils/joi.js'
import { parseMtime } from './utils/parse-mtime.js'

export const mkdirResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        arg: Joi.string().trim().min(1).required().error(new Error('no path given')),
        mode: Joi.string(),
        mtime: Joi.number().integer(),
        mtimeNsecs: Joi.number().integer().min(0),
        parents: Joi.boolean().default(false),
        hashAlg: Joi.string().default('sha2-256'),
        cidVersion: Joi.number().integer().valid(0, 1).default(0),
        flush: Joi.boolean().default(true),
        shardSplitThreshold: Joi.number().integer().min(0).default(1000),
        timeout: Joi.timeout()
      })
        .rename('p', 'parents', {
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
        .rename('cid-version', 'cidVersion', {
          override: true,
          ignoreUndefined: true
        })
        .rename('mtime-nsecs', 'mtimeNsecs', {
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
      mode,
      mtime,
      mtimeNsecs,
      parents,
      hashAlg,
      cidVersion,
      flush,
      shardSplitThreshold,
      timeout
    } = request.query

    await ipfs.files.mkdir(arg, {
      mode,
      mtime: parseMtime(mtime, mtimeNsecs),
      parents,
      hashAlg,
      cidVersion,
      flush,
      shardSplitThreshold,
      signal: request.app.signal,
      timeout
    })

    return h.response()
  }
}
