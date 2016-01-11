'use strict'

const os = require('os')

exports = module.exports

exports.repoPath = function () {
  return process.env.IPFS_PATH || os.homedir() + '/.ipfs'
}
