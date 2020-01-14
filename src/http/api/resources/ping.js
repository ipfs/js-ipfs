'use strict'

const Joi = require('@hapi/joi')
const { PassThrough } = require('stream')
const toIterable = require('stream-to-it')
const pipe = require('it-pipe')
const ndjson = require('iterable-ndjson')
const { map } = require('streaming-iterables')

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
  async handler (request, h) {
    const { ipfs } = request.server.app
    const peerId = request.query.arg

    // Default count to 10
    const count = request.query.n || request.query.count || 10

    // eslint-disable-next-line no-async-promise-executor
    const stream = await new Promise(async (resolve, reject) => {
      let started = false
      const stream = new PassThrough()

      try {
        await pipe(
          ipfs.ping(peerId, { count }),
          map(pong => {
            if (!started) {
              started = true
              resolve(stream)
            }
            return pong
          }),
          ndjson.stringify,
          toIterable.sink(stream)
        )
      } catch (err) {
        reject(err)
      }
    })

    return h.response(stream)
      .type('application/json')
      .header('X-Chunked-Output', '1')
  }
}
