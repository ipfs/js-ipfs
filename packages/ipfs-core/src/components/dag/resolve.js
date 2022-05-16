import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { toCidAndPath } from 'ipfs-core-utils/to-cid-and-path'
import { resolvePath } from '../../utils.js'

/**
 * @param {object} config
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
export function createResolve ({ repo, codecs, preload }) {
  /**
   * @type {import('ipfs-core-types/src/dag').API<{}>["resolve"]}
   */
  async function dagResolve (ipfsPath, options = {}) {
    const {
      cid
    } = toCidAndPath(ipfsPath)

    if (options.preload !== false) {
      preload(cid)
    }

    return resolvePath(repo, codecs, ipfsPath, options)
  }

  return withTimeoutOption(dagResolve)
}
