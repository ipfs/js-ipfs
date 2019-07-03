'use strict'

const Joi = require('@hapi/joi')
const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/ipfs/{cidPath*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: {
          cidPath: Joi.string().required()
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
    path: '/ipns/{libp2pKeyOrFqdn*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: {
          libp2pKeyOrFqdn: Joi.string().required()
        }
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
