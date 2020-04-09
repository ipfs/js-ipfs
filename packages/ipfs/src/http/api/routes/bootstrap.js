'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/bootstrap',
    handler: resources.bootstrap.list
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/add',
    options: {
      pre: [
        { method: resources.bootstrap.add.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.bootstrap.add.handler
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/add/default',
    handler: resources.bootstrap.addDefault
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/list',
    handler: resources.bootstrap.list
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/rm',
    options: {
      pre: [
        { method: resources.bootstrap.rm.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.bootstrap.rm.handler
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/rm/all',
    handler: resources.bootstrap.rmAll
  }
]
