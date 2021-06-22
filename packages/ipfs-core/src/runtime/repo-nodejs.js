'use strict'

const os = require('os')
const IPFSRepo = require('ipfs-repo')
const path = require('path')

/**
 * @param {import('../types').Print} print
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} options.autoMigrate
 */
module.exports = (print, options = { autoMigrate: true }) => {
  const repoPath = options.path || path.join(os.homedir(), '.jsipfs')
  /**
   * @type {number}
   */
  let lastMigration

  /**
   * @param {number} version
   * @param {string} percentComplete
   * @param {string} message
   */
  const onMigrationProgress = (version, percentComplete, message) => {
    if (version !== lastMigration) {
      lastMigration = version

      print(`Migrating repo from v${version - 1} to v${version}`)
    }

    print(`${percentComplete.toString().padStart(6, ' ')}% ${message}`)
  }

  return new IPFSRepo(repoPath, {
    autoMigrate: options.autoMigrate,
    onMigrationProgress: onMigrationProgress
  })
}
