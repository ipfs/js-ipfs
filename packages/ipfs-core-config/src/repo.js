import os from 'os'
import { createRepo as create } from 'ipfs-repo'
import path from 'path'
import { FsDatastore } from 'datastore-fs'
import { LevelDatastore } from 'datastore-level'
import { BlockstoreDatastoreAdapter } from 'blockstore-datastore-adapter'
import { ShardingDatastore } from 'datastore-core/sharding'
import { NextToLast } from 'datastore-core/shard'
import { FSLock } from 'ipfs-repo/locks/fs'
import { MountDatastore } from 'datastore-core/mount'
import { Key } from 'interface-datastore/key'
import { LRUDatastore } from './utils/lru-datastore.js'

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
 * @param {number} [options.peerStoreCacheSize]
 */
export function createRepo (print, codecs, options = {}) {
  const repoPath = options.path || path.join(os.homedir(), '.jsipfs')
  const peerStoreCacheSize = options.peerStoreCacheSize || 1024
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

  const defaultDatastore = new LevelDatastore(`${repoPath}/datastore`)

  return create(repoPath, (codeOrName) => codecs.getCodec(codeOrName), {
    root: new FsDatastore(repoPath, {
      extension: ''
    }),
    blocks: new BlockstoreDatastoreAdapter(
      new ShardingDatastore(
        new FsDatastore(`${repoPath}/blocks`, {
          extension: '.data'
        }),
        new NextToLast(2)
      )
    ),
    datastore: new MountDatastore([{
      prefix: new Key('/peers'),
      datastore: new LRUDatastore(peerStoreCacheSize, defaultDatastore)
    }, {
      prefix: new Key('/'),
      datastore: defaultDatastore
    }]),
    keys: new FsDatastore(`${repoPath}/keys`),
    pins: new LevelDatastore(`${repoPath}/pins`)
  }, {
    autoMigrate: options.autoMigrate != null ? options.autoMigrate : true,
    onMigrationProgress: onMigrationProgress,
    repoLock: FSLock
  })
}
