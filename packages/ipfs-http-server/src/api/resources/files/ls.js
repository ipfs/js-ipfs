import Joi from '../../../utils/joi.js'
import all from 'it-all'
import map from 'it-map'
import { pipe } from 'it-pipe'
import { streamResponse } from '../../../utils/stream-response.js'

/**
 * @param {*} entry
 * @param {import('multiformats/bases/interface').MultibaseCodec<any>} base
 * @param {boolean} [long]
 */
const mapEntry = (entry, base, long) => {
  const type = entry.type === 'file' ? 0 : 1

  return {
    Name: entry.name,
    Type: long ? type : 0,
    Size: long ? entry.size || 0 : 0,
    Hash: entry.cid.toString(base.encoder),
    Mtime: entry.mtime ? entry.mtime.secs : undefined,
    MtimeNsecs: entry.mtime ? entry.mtime.nsecs : undefined,
    Mode: entry.mode != null ? entry.mode.toString(8).padStart(4, '0') : undefined
  }
}

export const lsResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        path: Joi.string().default('/'),
        long: Joi.boolean().default(false),
        cidBase: Joi.string().default('base58btc'),
        stream: Joi.boolean().default(false),
        timeout: Joi.timeout()
      })
        .rename('arg', 'path', {
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
        long,
        cidBase,
        stream,
        timeout
      }
    } = request

    const base = await ipfs.bases.getBase(cidBase)

    if (stream) {
      return streamResponse(request, h, () => pipe(
        ipfs.files.ls(path, {
          signal,
          timeout
        }),
        source => map(source, (entry) => mapEntry(entry, base, long))
      ))
    }

    const files = await all(ipfs.files.ls(path, {
      signal,
      timeout
    }))

    return h.response({
      Entries: files.map(entry => mapEntry(entry, base, long))
    })
  }
}
