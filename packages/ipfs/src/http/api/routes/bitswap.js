'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/bitswap/wantlist',
    options: {
      validate: resources.bitswap.wantlist.validate
    },
    handler: resources.bitswap.wantlist.handler
  },
  {
    method: '*',
    path: '/api/v0/bitswap/stat',
    options: {
      validate: resources.bitswap.stat.validate
    },
    handler: resources.bitswap.stat.handler
  },
  {
    method: '*',
    path: '/api/v0/bitswap/unwant',
    options: {
      pre: [
        { method: resources.bitswap.unwant.parseArgs, assign: 'args' }
      ],
      validate: resources.bitswap.unwant.validate
    },
    handler: resources.bitswap.unwant.handler
  }
]
