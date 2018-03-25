'use strict'

const Joi = require('joi')
const boom = require('boom')
const toStream = require('pull-stream-to-stream')

exports = module.exports

exports.get = {
  validate: {
    query: Joi.object().keys({
      n: Joi.alternatives()
        .when('count', {
          is: true, then: Joi.any().forbidden(),
          otherwise: Joi.number().greater(0)
        }),
      count: Joi.number().greater(0),
      arg: Joi.string()
    })
  },
  handler: (request, reply) => {
    const ipfs = request.server.app.ipfs
    const peerId = request.query.arg
    // Default count to 10
    const count = request.query.n || request.query.count || 10

    ipfs.ping(peerId, count, (err, sourceStream) => {
      if (err) {
        return reply(boom.badRequest(err))
      }
      console.log(sourceStream)

      return reply(sourceStream).type('application/json').header('x-chunked-output', '1')
    })
  }
}
