'use strict'

const os = require('os')
const IPFSRepo = require('ipfs-repo')
const path = require('path')

module.exports = options => {
  options = options || {}
  const repoPath = options.path || path.join(os.homedir(), '.jsipfs')
  let lastMigration = null

  let onMigrationProgress = (version, percentComplete, message) => {
    if (version !== lastMigration) {
      lastMigration = version

      console.info(`Migrating repo from v${version - 1} to v${version}`) // eslint-disable-line no-console
    }

    console.info(`${percentComplete.toString().padStart(6, ' ')}% ${message}`) // eslint-disable-line no-console
  }

  if (options.silent) {
    onMigrationProgress = null
  }

  return new IPFSRepo(repoPath, {
    autoMigrate: options.autoMigrate,
    onMigrationProgress
  })
}
