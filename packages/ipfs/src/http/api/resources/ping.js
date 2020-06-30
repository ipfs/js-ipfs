'use strict'

const Joi = require('../../utils/joi')
const pipe = require('it-pipe')
const { map } = require('streaming-iterables')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')

module.exports = {
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
      map(pong => ({ Success: pong.success, Time: pong.time, Text: pong.text })),
      ndjson.stringify
    ))
  }
}
