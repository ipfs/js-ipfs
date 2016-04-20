'use strict'

const os = require('os')
const fs = require('fs-blob-store')
const IPFSRepo = require('ipfs-repo')

module.exports = () => {
  const repoPath = process.env.IPFS_PATH || os.homedir() + '/.ipfs'
  return new IPFSRepo(repoPath, {stores: fs})
}
