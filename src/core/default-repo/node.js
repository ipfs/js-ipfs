'use strict'

const os = require('os')
const Store = require('fs-pull-blob-store')
const IPFSRepo = require('ipfs-repo')
const path = require('path')

module.exports = (dir) => {
  const repoPath = dir || path.join(os.homedir(), '.ipfs')
  return new IPFSRepo(repoPath, {stores: Store})
}
