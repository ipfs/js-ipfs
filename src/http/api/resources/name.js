'use strict'

const Joi = require('@hapi/joi')
const pipe = require('it-pipe')
const { map } = require('streaming-iterables')
const last = require('it-last')
const ndjson = require('iterable-ndjson')
const streamResponse = require('../../utils/stream-response')

exports.resolve = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string(),
      nocache: Joi.boolean().default(false),
      recursive: Joi.boolean().default(true),
      stream: Joi.boolean().default(false)
    }).unknown()
  },
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { arg, stream } = request.query

    if (!stream) {
      const value = await last(ipfs.name.resolve(arg, request.query))
      return h.response({ Path: value })
    }

    return streamResponse(request, h, () => pipe(
      ipfs.name.resolve(arg, request.query),
      map(value => ({ Path: value })),
      ndjson.stringify
    ))
  }
}

exports.publish = {
  validate: {
    query: Joi.object().keys({
      arg: Joi.string().required(),
      resolve: Joi.boolean().default(true),
      lifetime: Joi.string().default('24h'),
      key: Joi.string().default('self')
    }).unknown()
  },
  async handler (request, h) {
    const { ipfs } = request.server.app
    const { arg } = request.query

    const res = await ipfs.name.publish(arg, request.query)

    return h.response({
      Name: res.name,
      Value: res.value
    })
  }
}

exports.pubsub = {
  state: {
    async handler (request, h) {
      const { ipfs } = request.server.app

      const res = await ipfs.name.pubsub.state()

      return h.response({
        Enabled: res.enabled
      })
    }
  },
  subs: {
    async handler (request, h) {
      const { ipfs } = request.server.app

      const res = await ipfs.name.pubsub.subs()

      return h.response({
        Strings: res
      })
    }
  },
  cancel: {
    validate: {
      query: Joi.object().keys({
        arg: Joi.string().required()
      }).unknown()
    },
    async handler (request, h) {
      const { ipfs } = request.server.app
      const { arg } = request.query

      const res = await ipfs.name.pubsub.cancel(arg)

      return h.response({
        Canceled: res.canceled
      })
    }
  }
}
