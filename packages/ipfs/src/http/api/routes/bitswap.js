'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/bitswap/wantlist',
    ...resources.bitswap.wantlist
  },
  {
    method: 'POST',
    path: '/api/v0/bitswap/stat',
    ...resources.bitswap.stat
  },
  {
    method: 'POST',
    path: '/api/v0/bitswap/unwant',
    ...resources.bitswap.unwant
  }
]
