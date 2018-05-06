'use strict'

const Joi = require('joi')
const boom = require('boom')
const toStream = require('pull-stream-to-stream')
const PassThrough = require('readable-stream').PassThrough
const pump = require('pump')

exports = module.exports

exports.get = {
  validate: {
    query: Joi.object().keys({
      n: Joi.alternatives()
        .when('count', {
          is: Joi.any().exist(),
          then: Joi.any().forbidden(),
          otherwise: Joi.number().greater(0)
        }),
      count: Joi.number().greater(0),
      arg: Joi.string().required()
    }).unknown()
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const peerId = request.query.arg
    // Default count to 10
    const count = request.query.n || request.query.count || 10
    ipfs.ping(peerId, count, (err, pullStream) => {
      if (err) {
        return reply(boom.badRequest(err))
      }
      // Streams from pull-stream-to-stream don't seem to be compatible
      // with the stream2 readable interface
      // see: https://github.com/hapijs/hapi/blob/c23070a3de1b328876d5e64e679a147fafb04b38/lib/response.js#L533
      // and: https://github.com/pull-stream/pull-stream-to-stream/blob/e436acee18b71af8e71d1b5d32eee642351517c7/index.js#L28
      const responseStream = toStream.source(pullStream)
      const stream2 = new PassThrough()
      pump(responseStream, stream2)
      return reply(stream2).type('application/json').header('X-Chunked-Output', '1')
    })
  }
}
