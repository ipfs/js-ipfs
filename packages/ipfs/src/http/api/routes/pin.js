'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/pin/add',
    options: {
      pre: [
        { method: resources.pin.add.parseArgs, assign: 'args' }
      ],
      validate: resources.pin.add.validate
    },
    handler: resources.pin.add.handler
  },
  {
    method: 'POST',
    path: '/api/v0/pin/rm',
    options: {
      pre: [
        { method: resources.pin.rm.parseArgs, assign: 'args' }
      ],
      validate: resources.pin.rm.validate
    },
    handler: resources.pin.rm.handler
  },
  {
    method: 'POST',
    path: '/api/v0/pin/ls',
    config: {
      pre: [
        { method: resources.pin.ls.parseArgs, assign: 'args' }
      ],
      validate: resources.pin.ls.validate
    },
    handler: resources.pin.ls.handler
  }
]
