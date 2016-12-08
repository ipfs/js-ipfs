'use strict'

const Joi = require('joi')
const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/pubsub/sub/{topic}',
    config: {
      handler: resources.pubsub.subscribe.handler,
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
    path: '/api/v0/pubsub/pub',
    config: {
      handler: resources.pubsub.publish.handler,
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
    path: '/api/v0/pubsub/ls',
    config: {
      handler: resources.pubsub.ls.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/pubsub/peers',
    config: {
      handler: resources.pubsub.peers.handler,
      validate: {
        params: {
          topic: Joi.string().required()
        }
      }
    }
  })
}
