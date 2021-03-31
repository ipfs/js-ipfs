'use strict'

const { map } = require('streaming-iterables')
const { pipe } = require('it-pipe')
// @ts-ignore no types
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')
const Joi = require('../../utils/joi')

exports.bitswap = require('./bitswap').stat

exports.repo = require('./repo').stat

exports.bw = {
  options: {
    validate: {
      options: {
        allowUnknown: true,
        stripUnknown: true
      },
      query: Joi.object().keys({
        peer: Joi.cid(),
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
      map(stat => ({
        TotalIn: stat.totalIn.toString(),
        TotalOut: stat.totalOut.toString(),
        RateIn: stat.rateIn.toString(),
        RateOut: stat.rateOut.toString()
      })),
      ndjson.stringify
    ))
  }
}
