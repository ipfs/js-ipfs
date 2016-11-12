'use strict'

const Joi = require('joi')
const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/pubsub/sub/{topic}',
    config: {
      handler: resources.floodsub.sub,
      validate: {
        params: {
          topic: Joi.string().required()
        },
        query: {
          discover: Joi.boolean()
        },
      }
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/floodsub/pub',
    config: {
      handler: resources.floodsub.pub,
      validate: {
        query: {
          topic: Joi.string().required(),
          buf: Joi.binary().required()
        },
      }
    }
  })
}
