'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/dag/get',
    ...resources.dag.get
  },
  {
    method: 'POST',
    path: '/api/v0/dag/put',
    ...resources.dag.put
  },
  {
    method: 'POST',
    path: '/api/v0/dag/resolve',
    ...resources.dag.resolve
  }
]
