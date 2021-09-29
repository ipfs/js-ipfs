
import { nanoid } from 'nanoid'
import { codecs } from './codecs.js'
import { createBackend } from './create-backend.js'
import { Key } from 'interface-datastore/key'
import { createRepo } from 'ipfs-repo'
import { MemoryLock } from 'ipfs-repo/locks/memory'

/**
 * @param {object} options
 * @param {string} [options.path]
 * @param {number} [options.version]
 * @param {number} [options.spec]
 * @param {boolean} [options.autoMigrate]
 * @param {(version: number, percentComplete: string, message: string) => void} [options.onMigrationProgress]
 * @param {import('ipfs-core-types/src/config').Config} [options.config]
 */
export async function createTempRepo (options = {}) {
  const path = options.path || 'ipfs-test-' + nanoid()

  const backend = createBackend()
  const encoder = new TextEncoder()

  if (options.version) {
    await backend.root.open()
    await backend.root.put(new Key('/version'), encoder.encode(`${options.version}`))
    await backend.root.close()
  }

  if (options.spec) {
    await backend.root.open()
    await backend.root.put(new Key('/datastore_spec'), encoder.encode(`${options.spec}`))
    await backend.root.close()
  }

  if (options.config) {
    await backend.root.open()
    await backend.root.put(new Key('/config'), encoder.encode(JSON.stringify(options.config)))
    await backend.root.close()
  }

  return createRepo(path, (codeOrName) => codecs.getCodec(codeOrName), backend, {
    repoLock: MemoryLock,
    autoMigrate: options.autoMigrate,
    onMigrationProgress: options.onMigrationProgress
  })
}
