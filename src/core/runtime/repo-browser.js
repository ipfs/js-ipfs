'use strict'

const IPFSRepo = require('ipfs-repo')

module.exports = (dir, options) => {
  const repoPath = dir || 'ipfs'
  return new IPFSRepo(repoPath, options)
}
