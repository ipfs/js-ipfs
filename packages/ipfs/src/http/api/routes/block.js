'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/block/get',
    options: {
      pre: [
        { method: resources.block.get.parseArgs, assign: 'args' }
      ]
    },
    handler: resources.block.get.handler
  },
  {
    method: '*',
    path: '/api/v0/block/put',
    options: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.block.put.parseArgs, assign: 'args' }
      ],
      validate: resources.block.put.validate
    },
    handler: resources.block.put.handler
  },
  {
    method: '*',
    path: '/api/v0/block/rm',
    options: {
      pre: [
        { method: resources.block.rm.parseArgs, assign: 'args' }
      ],
      validate: resources.block.rm.validate
    },
    handler: resources.block.rm.handler
  },
  {
    method: '*',
    path: '/api/v0/block/stat',
    config: {
      pre: [
        { method: resources.block.stat.parseArgs, assign: 'args' }
      ],
      validate: resources.block.stat.validate
    },
    handler: resources.block.stat.handler
  }
]
