import * as dagPB from '@ipld/dag-pb'
import { sha256 } from 'multiformats/hashes/sha2'
import { UnixFS } from 'ipfs-unixfs'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { CID } from 'multiformats/cid'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
export function createNew ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/object').API<{}>["new"]}
   */
  async function _new (options = {}) {
    let data

    if (options.template) {
      if (options.template === 'unixfs-dir') {
        data = (new UnixFS({ type: 'directory' })).marshal()
      } else {
        throw new Error('unknown template')
      }
    }

    const buf = dagPB.encode({
      Data: data,
      Links: []
    })
    const hash = await sha256.digest(buf)
    const cid = CID.createV0(hash)

    await repo.blocks.put(cid, buf, {
      signal: options.signal
    })

    if (options.preload !== false) {
      preload(cid)
    }

    return cid
  }

  return withTimeoutOption(_new)
}
