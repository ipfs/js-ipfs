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
  },
  {
    method: '*',
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
    method: '*',
    path: '/api/v0/config/profile/list',
    handler: resources.config.profiles.list.handler
  }
]
