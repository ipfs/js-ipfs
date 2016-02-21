'use strict'

const api = require('./../index.js').server.select('API')
const resources = require('./../resources')
const Joi = require('joi')

// https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L818
api.route({
  method: 'GET',
  path: '/api/v0/bootstrap',
  handler: resources.version.list
})

// https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L866
api.route({
  method: 'GET',
  path: '/api/v0/bootstrap/add',
  handler: resources.version.add,
  config: {
    validate: {
      query: {
        arg: Joi.string(), // multiaddr to add
        default: Joi.boolean()
      }
    }
  }
})

// https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L1081
api.route({
  method: 'GET',
  path: '/api/v0/bootstrap/list',
  handler: resources.version.list
})

// https://github.com/ipfs/http-api-spec/blob/master/apiary.apib#L1131
api.route({
  method: 'GET',
  path: '/api/v0/bootstrap/rm',
  handler: resources.version.rm,
  config: {
    validate: {
      query: {
        arg: Joi.string(), // multiaddr to rm
        all: Joi.boolean()
      }
    }
  }

})

