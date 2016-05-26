'use strict'

const idb = require('idb-plus-blob-store')
const IPFSRepo = require('ipfs-repo')

module.exports = (dir) => {
  const repoPath = dir || 'ipfs'
  return new IPFSRepo(repoPath, {stores: idb})
}
