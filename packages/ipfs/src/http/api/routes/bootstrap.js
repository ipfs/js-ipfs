'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/bootstrap',
    ...resources.bootstrap.list
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/add',
    ...resources.bootstrap.add
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/add/default',
    ...resources.bootstrap.addDefault
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/list',
    ...resources.bootstrap.list
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/rm',
    ...resources.bootstrap.rm
  },
  {
    method: 'POST',
    path: '/api/v0/bootstrap/rm/all',
    ...resources.bootstrap.rmAll
  }
]
