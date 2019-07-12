'use strict'

const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const resources = require('../resources')
const isIpfs = require('is-ipfs')

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
    path: '/ipns/{path*}',
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
    path: '/{path*}',
    handler: {
      proxy: {
        mapUri: request => {
          if (!isIpfs.ipfsSubdomain(request.url.toString())) {
            throw Boom.notFound()
          }

          const cid = request.url.hostname.split('.')[0]
          let uri = `${request.server.info.uri}/ipfs/${cid}`

          if (request.url.pathname !== '/') {
            uri += request.url.pathname
          }

          console.log(`${request.url} -> ${uri}`)
          return { uri }
        }
      }
    }
  }
]
