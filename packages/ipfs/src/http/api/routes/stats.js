'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/stats/bitswap',
    options: {
      validate: resources.stats.bitswap.validate
    },
    handler: resources.stats.bitswap.handler
  },
  {
    method: 'POST',
    path: '/api/v0/stats/repo',
    handler: resources.stats.repo
  },
  {
    method: 'POST',
    path: '/api/v0/stats/bw',
    handler: resources.stats.bw
  }
]
