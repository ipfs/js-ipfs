import Joi from '../../utils/joi.js'
import { pipe } from 'it-pipe'
import map from 'it-map'
import { streamResponse } from '../../utils/stream-response.js'

export const pingResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        count: Joi.number().integer().greater(0).default(10),
        peerId: Joi.peerId().required(),
        timeout: Joi.timeout()
      })
        .rename('arg', 'peerId', {
          override: true,
          ignoreUndefined: true
        })
        .rename('n', 'count', {
          override: true,
          ignoreUndefined: true
        })
    }
  },
  /**
   * @param {import('../../types').Request} request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  handler (request, h) {
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
        peerId,
        count,
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.ping(peerId, {
        count,
        signal,
        timeout
      }),
      async function * (source) {
        yield * map(source, pong => ({ Success: pong.success, Time: pong.time, Text: pong.text }))
      }
    ))
  }
}
