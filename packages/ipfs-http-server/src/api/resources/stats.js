import map from 'it-map'
import { pipe } from 'it-pipe'
import { streamResponse } from '../../utils/stream-response.js'
import Joi from '../../utils/joi.js'

export { statResource as bitswapResource } from './bitswap.js'

export { statResource as repoResource } from './repo.js'

export const bwResource = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peer: Joi.peerId(),
        proto: Joi.string(),
        poll: Joi.boolean().default(false),
        interval: Joi.string().default('1s'),
        timeout: Joi.timeout()
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
        peer,
        proto,
        poll,
        interval,
        timeout
      }
    } = request

    return streamResponse(request, h, () => pipe(
      ipfs.stats.bw({
        peer,
        proto,
        poll,
        interval,
        signal,
        timeout
      }),
      async function * (source) {
        yield * map(source, stat => ({
          TotalIn: stat.totalIn.toString(),
          TotalOut: stat.totalOut.toString(),
          RateIn: stat.rateIn,
          RateOut: stat.rateOut
        }))
      }
    ))
  }
}
