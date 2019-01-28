'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/config/{key?}',
    options: {
      pre: [
        { method: resources.config.getOrSet.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.config.getOrSet.handler
  },
  {
    method: '*',
    path: '/api/v0/config/show',
    handler: resources.config.show
  },
  {
    method: '*',
    path: '/api/v0/config/replace',
    options: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.config.replace.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.config.replace.handler
  }
]
