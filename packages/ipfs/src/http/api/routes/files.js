'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/files/chmod',
    options: resources.files.chmod.options,
    handler: resources.files.chmod.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/cp',
    options: resources.files.cp.options,
    handler: resources.files.cp.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/flush',
    options: resources.files.flush.options,
    handler: resources.files.flush.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/ls',
    options: resources.files.ls.options,
    handler: resources.files.ls.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/mkdir',
    options: resources.files.mkdir.options,
    handler: resources.files.mkdir.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/mv',
    options: resources.files.mv.options,
    handler: resources.files.mv.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/read',
    options: resources.files.read.options,
    handler: resources.files.read.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/rm',
    options: resources.files.rm.options,
    handler: resources.files.rm.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/stat',
    options: resources.files.stat.options,
    handler: resources.files.stat.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/touch',
    options: resources.files.touch.options,
    handler: resources.files.touch.handler
  },
  {
    method: 'POST',
    path: '/api/v0/files/write',
    options: resources.files.write.options,
    handler: resources.files.write.handler
  }
]
