'use strict'

const Joi = require('@hapi/joi')
const pull = require('pull-stream')
const ndjson = require('pull-ndjson')
const { PassThrough } = require('readable-stream')

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

    const responseStream = await new Promise((resolve, reject) => {
      const stream = new PassThrough()

      pull(
        ipfs.pingPullStream(peerId, { count }),
        pull.map((chunk) => ({
          Success: chunk.success,
          Time: chunk.time,
          Text: chunk.text
        })),
        ndjson.serialize(),
        pull.drain(chunk => {
          stream.write(chunk)
        }, err => {
          if (err) return reject(err)
          resolve(stream)
          stream.end()
        })
      )
    })

    return h.response(responseStream)
      .type('application/json')
      .header('X-Chunked-Output', '1')
  }
}
