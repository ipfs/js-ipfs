'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/stats/bitswap',
    ...resources.stats.bitswap
  },
  {
    method: 'POST',
    path: '/api/v0/stats/repo',
    ...resources.stats.repo
  },
  {
    method: 'POST',
    path: '/api/v0/stats/bw',
    ...resources.stats.bw
  }
]
