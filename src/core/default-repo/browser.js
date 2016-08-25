'use strict'

const Store = require('idb-pull-blob-store')
const IPFSRepo = require('ipfs-repo')

module.exports = (dir) => {
  const repoPath = dir || 'ipfs'
  return new IPFSRepo(repoPath, {stores: Store})
}
