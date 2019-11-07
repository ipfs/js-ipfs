'use strict'

const os = require('os')
const IPFSRepo = require('ipfs-repo')
const path = require('path')

module.exports = (options) => {
  const repoPath = options.repo || path.join(os.homedir(), '.jsipfs')

  return new IPFSRepo(repoPath, { autoMigrate: options.repoAutoMigrate })
}
