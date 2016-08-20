'use strict'

const resources = require('./../resources')
const Joi = require('joi')

module.exports = (server) => {
  const api = server.select('API')

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L818
  api.route({
    method: '*',
    path: '/api/v0/bootstrap',
    handler: resources.bootstrap.list
  })

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L866
  api.route({
    method: '*',
    path: '/api/v0/bootstrap/add',
    handler: resources.bootstrap.add,
    config: {
      validate: {
        query: {
          arg: Joi.string().required(), // multiaddr to add
          default: Joi.boolean()
        }
      }
    }
  })

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L1081
  api.route({
    method: '*',
    path: '/api/v0/bootstrap/list',
    handler: resources.bootstrap.list
  })

  // https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L1131
  api.route({
    method: '*',
    path: '/api/v0/bootstrap/rm',
    handler: resources.bootstrap.rm,
    config: {
      validate: {
        query: {
          arg: Joi.string().required(), // multiaddr to rm
          all: Joi.boolean()
        }
      }
    }
  })
}
