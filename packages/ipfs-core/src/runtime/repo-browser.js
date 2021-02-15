'use strict'

const IPFSRepo = require('ipfs-repo')

/**
 * @param {import('../types').Print} print
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} options.autoMigrate
 */
module.exports = (print, options) => {
  const repoPath = options.path || 'ipfs'
  return new IPFSRepo(repoPath, { autoMigrate: options.autoMigrate })
}
