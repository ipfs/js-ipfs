'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: '*',
    path: '/api/v0/repo/version',
    handler: resources.repo.version
  },
  {
    method: '*',
    path: '/api/v0/repo/stat',
    handler: resources.repo.stat
  },
  {
    method: '*',
    path: '/api/v0/repo/gc',
    options: {
      validate: resources.repo.gc.validate
    },
    handler: resources.repo.gc.handler
  }
  // TODO: implement the missing spec https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/REPO.md
]
