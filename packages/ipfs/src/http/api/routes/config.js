'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/config/{key?}',
    options: {
      pre: [
        { method: resources.config.getOrSet.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.config.getOrSet.handler
  },
  {
    method: 'POST',
    path: '/api/v0/config/show',
    handler: resources.config.show
  },
  {
    method: 'POST',
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
  },
  {
    method: 'POST',
    path: '/api/v0/config/profile/apply',
    options: {
      pre: [
        { method: resources.config.profiles.apply.parseArgs, assign: 'args' }
      ],
      validate: resources.config.profiles.apply.validate
    },
    handler: resources.config.profiles.apply.handler
  },
  {
    method: 'POST',
    path: '/api/v0/config/profile/list',
    handler: resources.config.profiles.list.handler
  }
]
