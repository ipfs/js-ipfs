'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/dht/findpeer',
    config: {
      handler: resources.dht.findPeer.handler,
      validate: resources.dht.findPeer.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/dht/findprovs',
    config: {
      handler: resources.dht.findProvs.handler,
      validate: resources.dht.findProvs.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/dht/get',
    config: {
      handler: resources.dht.get.handler,
      validate: resources.dht.get.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/dht/provide',
    config: {
      handler: resources.dht.provide.handler,
      validate: resources.dht.provide.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/dht/put',
    config: {
      pre: [
        { method: resources.dht.put.parseArgs, assign: 'args' }
      ],
      handler: resources.dht.put.handler,
      validate: resources.dht.put.validate
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/dht/query',
    config: {
      handler: resources.dht.query.handler,
      validate: resources.dht.query.validate
    }
  })
}
