

import { createRepo as create } from 'ipfs-repo'
import DatastoreLevel from 'datastore-level'
import BlockstoreDatastoreAdapter from 'blockstore-datastore-adapter'

/**
 * @typedef {import('ipfs-repo-migrations').ProgressCallback} MigrationProgressCallback
 */

/**
 * @param {import('../types').Print} print
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @param {object} options
 * @param {string} [options.path]
 * @param {boolean} [options.autoMigrate]
 * @param {MigrationProgressCallback} [options.onMigrationProgress]
 */
export function createRepo (print, codecs, options) {
  const repoPath = options.path || 'ipfs'

  return create(repoPath, (codeOrName) => codecs.getCodec(codeOrName), {
    root: new DatastoreLevel(repoPath, {
      prefix: '',
      version: 2
    }),
    blocks: new BlockstoreDatastoreAdapter(
      new DatastoreLevel(`${repoPath}/blocks`, {
        prefix: '',
        version: 2
      })
    ),
    datastore: new DatastoreLevel(`${repoPath}/datastore`, {
      prefix: '',
      version: 2
    }),
    keys: new DatastoreLevel(`${repoPath}/keys`, {
      prefix: '',
      version: 2
    }),
    pins: new DatastoreLevel(`${repoPath}/pins`, {
      prefix: '',
      version: 2
    })
  }, {
    autoMigrate: options.autoMigrate,
    onMigrationProgress: options.onMigrationProgress || print
  })
}
