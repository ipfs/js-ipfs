import { createRepo as create } from 'ipfs-repo'
import { LevelDatastore } from 'datastore-level'
import { BlockstoreDatastoreAdapter } from 'blockstore-datastore-adapter'
import { MemoryLock } from 'ipfs-repo/locks/memory'

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
export function createRepo (print, codecs, options) {
  const repoPath = options.path || 'ipfs'

  return create(repoPath, (codeOrName) => codecs.getCodec(codeOrName), {
    root: new LevelDatastore(repoPath, {
      prefix: '',
      version: 2
    }),
    blocks: new BlockstoreDatastoreAdapter(
      new LevelDatastore(`${repoPath}/blocks`, {
        prefix: '',
        version: 2
      })
    ),
    datastore: new LevelDatastore(`${repoPath}/datastore`, {
      prefix: '',
      version: 2
    }),
    keys: new LevelDatastore(`${repoPath}/keys`, {
      prefix: '',
      version: 2
    }),
    pins: new LevelDatastore(`${repoPath}/pins`, {
      prefix: '',
      version: 2
    })
  }, {
    autoMigrate: options.autoMigrate,
    onMigrationProgress: options.onMigrationProgress || print,
    repoLock: MemoryLock
  })
}
