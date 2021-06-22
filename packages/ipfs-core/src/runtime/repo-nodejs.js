'use strict'

const os = require('os')
const IPFSRepo = require('ipfs-repo')
const path = require('path')

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
module.exports = (print, options = {}) => {
  const repoPath = options.path || path.join(os.homedir(), '.jsipfs')
  /**
   * @type {number}
   */
  let lastMigration

  /**
   * @type {MigrationProgressCallback}
   */
  const onMigrationProgress = options.onMigrationProgress || function (version, percentComplete, message) {
    if (version !== lastMigration) {
      lastMigration = version

      print(`Migrating repo from v${version - 1} to v${version}`)
    }

    print(`${percentComplete.toString().padStart(6, ' ')}% ${message}`)
  }

  return new IPFSRepo(repoPath, {
    autoMigrate: options.autoMigrate != null ? options.autoMigrate : true,
    onMigrationProgress: onMigrationProgress
  })
}
