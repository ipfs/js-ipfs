'use strict'

const Joi = require('@hapi/joi')
const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/ipfs/{ipfsPath*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: {
          ipfsPath: Joi.string().required()
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
    path: '/ipns/{ipnsPath*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: {
          ipnsPath: Joi.string().required()
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
