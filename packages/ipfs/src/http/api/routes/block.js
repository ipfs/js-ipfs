'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/block/get',
    ...resources.block.get
  },
  {
    method: 'POST',
    path: '/api/v0/block/put',
    ...resources.block.put
  },
  {
    method: 'POST',
    path: '/api/v0/block/rm',
    ...resources.block.rm
  },
  {
    method: 'POST',
    path: '/api/v0/block/stat',
    ...resources.block.stat
  }
]
