import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createLocal ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/refs').API<{}>["local"]}
   */
  async function * refsLocal (options = {}) {
    for await (const cid of repo.blocks.queryKeys({}, { signal: options.signal })) {
      yield { ref: cid.toString() }
    }
  }

  return withTimeoutOption(refsLocal)
}
