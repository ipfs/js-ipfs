'use strict'

const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const resources = require('../../gateway/resources')

const webuiPath = '/ipfs/QmQNHd1suZTktPRhP7DD4nKWG46ZRSxkwHocycHVrK3dYW'

const failAction = (request, h, err) => {
  // match go-ipfs and return 404 without any details if path validation failed
  if (err.name === 'ValidationError') throw Boom.notFound()
  return err
}

module.exports = [
  {
    method: '*',
    path: '/webui',
    handler (request, h) {
      return h.redirect(webuiPath)
    }
  },
  {
    method: '*',
    path: '/ipfs/{path*}',
    options: {
      handler: resources.gateway.handler,
      validate: {
        params: {
          path: Joi.string().regex(new RegExp(webuiPath.replace('/ipfs/', '^'))).required()
        },
        failAction
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
          path: Joi.alternatives().try(
            // be careful here, someone could register webui.ipfs.io.evil.com
            Joi.string().regex(/^webui\.ipfs\.io\//), // ends with '/''
            Joi.string().regex(/^webui\.ipfs\.io$/) // redirect will add '/'
          ).required()
        },
        failAction
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
