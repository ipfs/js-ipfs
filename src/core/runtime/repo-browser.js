'use strict'

const IPFSRepo = require('ipfs-repo')

module.exports = (options) => {
  const repoPath = options.repo || 'ipfs'
  return new IPFSRepo(repoPath, { autoMigrate: options.repoAutoMigrate })
}
