'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/pin/add',
    ...resources.pin.add
  },
  {
    method: 'POST',
    path: '/api/v0/pin/rm',
    ...resources.pin.rm
  },
  {
    method: 'POST',
    path: '/api/v0/pin/ls',
    ...resources.pin.ls
  }
]
