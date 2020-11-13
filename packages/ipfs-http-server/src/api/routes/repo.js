'use strict'

const resources = require('../resources')

module.exports = [
  {
    method: 'POST',
    path: '/api/v0/repo/version',
    ...resources.repo.version
  },
  {
    method: 'POST',
    path: '/api/v0/repo/stat',
    ...resources.repo.stat
  },
  {
    method: 'POST',
    path: '/api/v0/repo/gc',
    ...resources.repo.gc
  }
  // TODO: implement the missing spec https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/SPEC/REPO.md
]
