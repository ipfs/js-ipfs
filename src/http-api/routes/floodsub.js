'use strict'

const Joi = require('joi')
const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/pubsub/start',
    config: {
      handler: resources.floodsub.start.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pubsub/subscribe/{topic}',
    config: {
      handler: resources.floodsub.subscribe.handler,
      validate: {
        params: {
          topic: Joi.string().required()
        },
        query: {
          discover: Joi.boolean()
        }
      }
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pubsub/publish',
    config: {
      handler: resources.floodsub.publish.handler,
      validate: {
        query: {
          topic: Joi.string().required(),
          buf: Joi.binary().required()
        }
      }
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pubsub/unsubscribe/{topic}',
    config: {
      handler: resources.floodsub.unsubscribe.handler,
      validate: {
        params: {
          topic: Joi.string().required()
        }
      }
    }
  })
}
