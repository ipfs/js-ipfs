'use strict'

const Joi = require('@hapi/joi')
const resources = require('../../gateway/resources')

module.exports = [
  {
    method: '*',
    path: '/ipfs/{path*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: {
          path: Joi.string().required()
        }
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
    path: '/webui',
    handler (request, h) {
      return h.redirect('/ipfs/QmNyMYhwJUS1cVvaWoVBhrW8KPj1qmie7rZcWo8f1Bvkhz')
    }
  }
]
