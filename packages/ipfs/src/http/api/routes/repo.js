'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/repo/version',
    handler: resources.repo.version
  },
  {
    method: 'POST',
    path: '/api/v0/repo/stat',
    handler: resources.repo.stat
  },
  {
    method: 'POST',
    path: '/api/v0/repo/gc',
    options: {
      validate: resources.repo.gc.validate
    },
    handler: resources.repo.gc.handler
  }
  // TODO: implement the missing spec https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/SPEC/REPO.md
]
