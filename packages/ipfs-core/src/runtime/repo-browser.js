'use strict'

const IPFSRepo = require('ipfs-repo')

module.exports = (options = {}) => {
  const repoPath = options.path || 'ipfs'
  return new IPFSRepo(repoPath, { autoMigrate: options.autoMigrate })
}
