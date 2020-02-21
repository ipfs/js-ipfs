'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/dht/findpeer',
    options: {
      validate: resources.dht.findPeer.validate
    },
    handler: resources.dht.findPeer.handler
  },
  {
    method: '*',
    path: '/api/v0/dht/findprovs',
    options: {
      validate: resources.dht.findProvs.validate
    },
    handler: resources.dht.findProvs.handler
  },
  {
    method: '*',
    path: '/api/v0/dht/get',
    options: {
      validate: resources.dht.get.validate
    },
    handler: resources.dht.get.handler
  },
  {
    method: '*',
    path: '/api/v0/dht/provide',
    options: {
      validate: resources.dht.provide.validate
    },
    handler: resources.dht.provide.handler
  },
  {
    method: '*',
    path: '/api/v0/dht/put',
    options: {
      pre: [
        { method: resources.dht.put.parseArgs, assign: 'args' }
      ],
      validate: resources.dht.put.validate
    },
    handler: resources.dht.put.handler
  },
  {
    method: '*',
    path: '/api/v0/dht/query',
    options: {
      validate: resources.dht.query.validate
    },
    handler: resources.dht.query.handler
  }
]
