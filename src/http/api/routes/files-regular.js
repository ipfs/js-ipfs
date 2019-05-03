'use strict'

const resources = require('../resources')

module.exports = [
  {
    // TODO fix method
    method: '*',
    path: '/api/v0/cat',
    options: {
      pre: [
        { method: resources.filesRegular.cat.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.filesRegular.cat.handler
  },
  {
    // TODO fix method
    method: '*',
    path: '/api/v0/get',
    options: {
      pre: [
        { method: resources.filesRegular.get.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.filesRegular.get.handler
  },
  {
    // TODO fix method
    method: '*',
    path: '/api/v0/add',
    options: {
      payload: {
        parse: false,
        output: 'stream',
        maxBytes: Number.MAX_SAFE_INTEGER
      },
      validate: resources.filesRegular.add.validate
    },
    handler: resources.filesRegular.add.handler
  },
  {
    // TODO fix method
    method: '*',
    path: '/api/v0/ls',
    options: {
      pre: [
        { method: resources.filesRegular.ls.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.filesRegular.ls.handler
  },
  {
    // TODO fix method
    method: '*',
    path: '/api/v0/refs',
    options: {
      pre: [
        { method: resources.filesRegular.refs.parseArgs, assign: 'args' }
      ],
      validate: resources.filesRegular.refs.validate
    },
    handler: resources.filesRegular.refs.handler
  },
  {
    // TODO fix method
    method: '*',
    path: '/api/v0/refs/local',
    handler: resources.filesRegular.refs.local.handler
  }
]
