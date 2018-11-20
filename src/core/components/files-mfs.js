'use strict'

const mfs = require('ipfs-mfs/core')

module.exports = self => mfs({
  ipld: self._ipld,
  repo: self._repo,
  repoOwner: self._options.repoOwner
})
