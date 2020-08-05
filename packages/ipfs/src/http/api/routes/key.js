'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/key/list',
    ...resources.key.list
  },
  {
    method: 'POST',
    path: '/api/v0/key/gen',
    ...resources.key.gen
  },
  {
    method: 'POST',
    path: '/api/v0/key/rm',
    ...resources.key.rm
  },
  {
    method: 'POST',
    path: '/api/v0/key/rename',
    ...resources.key.rename
  },
  {
    method: 'POST',
    path: '/api/v0/key/import',
    ...resources.key.import
  }
]
