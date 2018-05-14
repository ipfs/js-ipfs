'use strict'

const Joi = require('joi')
const pull = require('pull-stream')
const toStream = require('pull-stream-to-stream')
const ndjson = require('pull-ndjson')
const PassThrough = require('readable-stream').PassThrough
const pump = require('pump')

exports.get = {
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
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const peerId = request.query.arg
    // Default count to 10
    const count = request.query.n || request.query.count || 10

    const source = pull(
      ipfs.pingPullStream(peerId, { count: count }),
      pull.map((chunk) => ({
        Success: chunk.success,
        Time: chunk.time,
        Text: chunk.text
      })),
      ndjson.serialize()
    )

    // Streams from pull-stream-to-stream don't seem to be compatible
    // with the stream2 readable interface
    // see: https://github.com/hapijs/hapi/blob/c23070a3de1b328876d5e64e679a147fafb04b38/lib/response.js#L533
    // and: https://github.com/pull-stream/pull-stream-to-stream/blob/e436acee18b71af8e71d1b5d32eee642351517c7/index.js#L28
    const responseStream = toStream.source(source)
    const stream2 = new PassThrough()
    pump(responseStream, stream2)
    return reply(stream2).type('application/json').header('X-Chunked-Output', '1')
  }
}
