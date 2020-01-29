'use strict'

const IPFSRepo = require('ipfs-repo')

module.exports = (options) => {
  options = options || {}
  const repoPath = options.path || 'ipfs'
  return new IPFSRepo(repoPath, { autoMigrate: options.autoMigrate })
}
