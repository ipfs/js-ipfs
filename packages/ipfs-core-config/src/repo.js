
import os from 'os'
import { createRepo as create } from 'ipfs-repo'
import path from 'path'
import DatastoreFS from 'datastore-fs'
import DatastoreLevel from 'datastore-level'
import BlockstoreDatastoreAdapter from 'blockstore-datastore-adapter'
import { ShardingDatastore, shard } from 'datastore-core'

const { NextToLast } = shard

/**
 * @typedef {import('ipfs-repo-migrations').ProgressCallback} MigrationProgressCallback
 */

/**
 * @param {(...args: any[]) => void} print
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} [options.autoMigrate]
 * @param {MigrationProgressCallback} [options.onMigrationProgress]
 */
export function createRepo (print, codecs, options = {}) {
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

  return create(repoPath, (codeOrName) => codecs.getCodec(codeOrName), {
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
