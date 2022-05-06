import * as dagPB from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
export function createPut ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/object').API<{}>["put"]}
   */
  async function put (obj, options = {}) {
    const release = await repo.gcLock.readLock()

    try {
      const buf = dagPB.encode(obj)
      const hash = await sha256.digest(buf)
      const cid = CID.createV1(dagPB.code, hash)

      await repo.blocks.put(cid, buf, {
        signal: options.signal
      })

      if (options.preload !== false) {
        preload(cid)
      }

      if (options.pin) {
        await repo.pins.pinRecursively(cid, {
          signal: options.signal
        })
      }

      return cid
    } finally {
      release()
    }
  }

  return withTimeoutOption(put)
}
