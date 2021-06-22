'use strict'

const IPFSRepo = require('ipfs-repo')

/**
 * @typedef {import('ipfs-repo-migrations').ProgressCallback} MigrationProgressCallback
 */

/**
 * @param {import('../types').Print} print
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} [options.autoMigrate]
 * @param {MigrationProgressCallback} [options.onMigrationProgress]
 */
module.exports = (print, options) => {
  const repoPath = options.path || 'ipfs'
  return new IPFSRepo(repoPath, {
    autoMigrate: options.autoMigrate,
    onMigrationProgress: options.onMigrationProgress || print
  })
}
