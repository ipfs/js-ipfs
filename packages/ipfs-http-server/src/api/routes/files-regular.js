'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/cat',
    ...resources.filesRegular.cat
  },
  {
    method: 'POST',
    path: '/api/v0/get',
    ...resources.filesRegular.get
  },
  {
    method: 'POST',
    path: '/api/v0/add',
    ...resources.filesRegular.add
  },
  {
    method: 'POST',
    path: '/api/v0/ls',
    ...resources.filesRegular.ls
  },
  {
    method: 'POST',
    path: '/api/v0/refs',
    ...resources.filesRegular.refs
  },
  {
    method: 'POST',
    path: '/api/v0/refs/local',
    ...resources.filesRegular.refsLocal
  }
]
