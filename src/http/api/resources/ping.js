'use strict'

const Joi = require('@hapi/joi')
const pipe = require('it-pipe')
const { map } = require('streaming-iterables')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')

module.exports = {
  validate: {
    query: Joi.object().keys({
      n: Joi.alternatives()
        .when('count', {
          is: Joi.any().exist(),
          then: Joi.any().forbidden(),
          otherwise: Joi.number().integer().greater(0)
        }),
      count: Joi.number().integer().greater(0),
      arg: Joi.string().required()
    }).unknown()
  },
  handler (request, h) {
    const { ipfs } = request.server.app
    const peerId = request.query.arg

    // Default count to 10
    const count = request.query.n || request.query.count || 10

    return streamResponse(request, h, () => pipe(
      ipfs.ping(peerId, { count }),
      map(pong => ({ Success: pong.success, Time: pong.time, Text: pong.text })),
      ndjson.stringify
    ))
  }
}
