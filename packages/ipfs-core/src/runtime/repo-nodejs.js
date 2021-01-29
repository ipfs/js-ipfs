'use strict'

const os = require('os')
const IPFSRepo = require('ipfs-repo')
const path = require('path')

/**
 * @param {Object} [options]
 * @param {string} [options.path]
 * @param {boolean} [options.silent]
 * @param {boolean} [options.autoMigrate]
 * @returns {Repo}
 */
module.exports = (options = {}) => {
  const repoPath = options.path || path.join(os.homedir(), '.jsipfs')
  let lastMigration = null

  const onMigrationProgress = (version, percentComplete, message) => {
    if (version !== lastMigration) {
      lastMigration = version

      console.info(`Migrating repo from v${version - 1} to v${version}`) // eslint-disable-line no-console
    }

    console.info(`${percentComplete.toString().padStart(6, ' ')}% ${message}`) // eslint-disable-line no-console
  }

  return new IPFSRepo(repoPath, {
    autoMigrate: options.autoMigrate,
    onMigrationProgress: options.silent ? null : onMigrationProgress
  })
}

/**
 * @typedef {import('ipfs-core-types/src/repo').Repo<IPFSConfig>} Repo
 * @typedef {import('../components/config').IPFSConfig} IPFSConfig
 */
