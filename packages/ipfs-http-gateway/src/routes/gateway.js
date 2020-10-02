'use strict'

const Joi = require('joi')
const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/ipfs/{path*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: Joi.object({
          path: Joi.string().required()
        })
      },
      response: {
        ranges: false // disable built-in support, handler does it manually
      },
      ext: {
        onPostHandler: { method: resources.gateway.afterHandler }
      }
    }
  },
  {
    method: '*',
    path: '/ipns/{path*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: Joi.object({
          path: Joi.string().required()
        })
      },
      response: {
        ranges: false // disable built-in support, handler does it manually
      },
      ext: {
        onPostHandler: { method: resources.gateway.afterHandler }
      }
    }
  }
]
