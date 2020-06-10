'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/files/chmod',
    ...resources.files.chmod
  },
  {
    method: 'POST',
    path: '/api/v0/files/cp',
    ...resources.files.cp
  },
  {
    method: 'POST',
    path: '/api/v0/files/flush',
    ...resources.files.flush
  },
  {
    method: 'POST',
    path: '/api/v0/files/ls',
    ...resources.files.ls
  },
  {
    method: 'POST',
    path: '/api/v0/files/mkdir',
    ...resources.files.mkdir
  },
  {
    method: 'POST',
    path: '/api/v0/files/mv',
    ...resources.files.mv
  },
  {
    method: 'POST',
    path: '/api/v0/files/read',
    ...resources.files.read
  },
  {
    method: 'POST',
    path: '/api/v0/files/rm',
    ...resources.files.rm
  },
  {
    method: 'POST',
    path: '/api/v0/files/stat',
    ...resources.files.stat
  },
  {
    method: 'POST',
    path: '/api/v0/files/touch',
    ...resources.files.touch
  },
  {
    method: 'POST',
    path: '/api/v0/files/write',
    ...resources.files.write
  }
]
