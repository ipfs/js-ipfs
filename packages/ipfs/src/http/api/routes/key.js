'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/key/list',
    handler: resources.key.list
  },
  {
    method: 'POST',
    path: '/api/v0/key/gen',
    handler: resources.key.gen
  },
  {
    method: 'POST',
    path: '/api/v0/key/rm',
    handler: resources.key.rm
  },
  {
    method: 'POST',
    path: '/api/v0/key/rename',
    handler: resources.key.rename
  },
  {
    method: 'POST',
    path: '/api/v0/key/export',
    handler: resources.key.export
  },
  {
    method: 'POST',
    path: '/api/v0/key/import',
    handler: resources.key.import
  }
]
