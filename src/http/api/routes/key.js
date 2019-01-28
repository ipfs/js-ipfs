'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/key/list',
    handler: resources.key.list
  },
  {
    method: '*',
    path: '/api/v0/key/gen',
    handler: resources.key.gen
  },
  {
    method: '*',
    path: '/api/v0/key/rm',
    handler: resources.key.rm
  },
  {
    method: '*',
    path: '/api/v0/key/rename',
    handler: resources.key.rename
  },
  {
    method: '*',
    path: '/api/v0/key/export',
    handler: resources.key.export
  },
  {
    method: '*',
    path: '/api/v0/key/import',
    handler: resources.key.import
  }
]
