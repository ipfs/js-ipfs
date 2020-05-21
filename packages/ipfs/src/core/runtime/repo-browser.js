'use strict'

const IPFSRepo = require('ipfs-repo')

/**
 * @typedef {Object} RepoOptions
 * @property {string} [path]
 * @property {boolean} [autoMigrate]
 *
 * @param {RepoOptions} [options]
 * @returns {IPFSRepo}
 */
module.exports = (options) => {
  options = options || {}
  const repoPath = options.path || 'ipfs'
  return new IPFSRepo(repoPath, { autoMigrate: options.autoMigrate })
}
