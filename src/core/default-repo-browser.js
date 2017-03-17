'use strict'

const IPFSRepo = require('ipfs-repo')

module.exports = (dir) => {
  const repoPath = dir || 'ipfs'
  return new IPFSRepo(repoPath)
}
