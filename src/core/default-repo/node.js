'use strict'

const os = require('os')
const fs = require('fs-blob-store')
const IPFSRepo = require('ipfs-repo')

const options = {
  stores: {
    keys: fs,
    config: fs,
    datastore: fs,
    // datastoreLegacy: needs https://github.com/ipfs/js-ipfs-repo/issues/6#issuecomment-164650642
    logs: fs,
    locks: fs,
    version: fs
  }
}

module.exports = () => {
  const repoPath = process.env.IPFS_PATH || os.homedir() + '/.ipfs'
  return new IPFSRepo(repoPath, options)
}
