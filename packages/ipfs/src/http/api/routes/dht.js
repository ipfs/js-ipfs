'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/dht/findpeer',
    ...resources.dht.findPeer
  },
  {
    method: 'POST',
    path: '/api/v0/dht/findprovs',
    ...resources.dht.findProvs
  },
  {
    method: 'POST',
    path: '/api/v0/dht/get',
    ...resources.dht.get
  },
  {
    method: 'POST',
    path: '/api/v0/dht/provide',
    ...resources.dht.provide
  },
  {
    method: 'POST',
    path: '/api/v0/dht/put',
    ...resources.dht.put
  },
  {
    method: 'POST',
    path: '/api/v0/dht/query',
    ...resources.dht.query
  }
]
