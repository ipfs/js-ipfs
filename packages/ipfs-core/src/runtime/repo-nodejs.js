'use strict'

const os = require('os')
const { createRepo } = require('ipfs-repo')
const path = require('path')
const DatastoreFS = require('datastore-fs')
const DatastoreLevel = require('datastore-level')
const BlockstoreDatastoreAdapter = require('blockstore-datastore-adapter')
const { ShardingDatastore, shard: { NextToLast } } = require('datastore-core')

/**
 * @typedef {import('ipfs-repo-migrations').ProgressCallback} MigrationProgressCallback
 */

/**
 * @param {import('../types').Print} print
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} [options.autoMigrate]
 * @param {MigrationProgressCallback} [options.onMigrationProgress]
 */
module.exports = (print, codecs, options = {}) => {
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

  return createRepo(repoPath, (codeOrName) => codecs.getCodec(codeOrName), {
    root: new DatastoreFS(repoPath, {
      extension: ''
    }),
    blocks: new BlockstoreDatastoreAdapter(
      new ShardingDatastore(
        new DatastoreFS(`${repoPath}/blocks`, {
          extension: '.data'
        }),
        new NextToLast(2)
      )
    ),
    datastore: new DatastoreLevel(`${repoPath}/datastore`),
    keys: new DatastoreFS(`${repoPath}/keys`),
    pins: new DatastoreLevel(`${repoPath}/pins`)
  }, {
    autoMigrate: options.autoMigrate != null ? options.autoMigrate : true,
    onMigrationProgress: onMigrationProgress
  })
}
