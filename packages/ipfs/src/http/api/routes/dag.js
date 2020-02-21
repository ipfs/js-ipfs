'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/dag/get',
    options: {
      pre: [
        { method: resources.dag.get.parseArgs, assign: 'args' }
      ],
      validate: resources.dag.get.validate
    },
    handler: resources.dag.get.handler
  },
  {
    method: 'POST',
    path: '/api/v0/dag/put',
    options: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.dag.put.parseArgs, assign: 'args' }
      ],
      validate: resources.dag.put.validate
    },
    handler: resources.dag.put.handler
  },
  {
    method: 'POST',
    path: '/api/v0/dag/resolve',
    options: {
      pre: [
        { method: resources.dag.resolve.parseArgs, assign: 'args' }
      ],
      validate: resources.dag.resolve.validate
    },
    handler: resources.dag.resolve.handler
  }
]
