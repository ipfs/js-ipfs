import { exporter } from 'ipfs-unixfs-exporter'
import { normalizeCidPath } from '../utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { CID } from 'multiformats/cid'

/**
 * @typedef {object} Context
 * @property {import('ipfs-repo').IPFSRepo} repo
 * @property {import('../types').Preload} preload
 *
 * @param {Context} context
 */
export function createCat ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["cat"]}
   */
  async function * cat (ipfsPath, options = {}) {
    ipfsPath = normalizeCidPath(ipfsPath)

    if (options.preload !== false) {
      const pathComponents = ipfsPath.split('/')
      preload(CID.parse(pathComponents[0]))
    }

    const file = await exporter(ipfsPath, repo.blocks, options)

    // File may not have unixfs prop if small & imported with rawLeaves true
    if (file.type === 'directory') {
      throw new Error('this dag node is a directory')
    }

    if (!file.content) {
      throw new Error('this dag node has no content')
    }

    yield * file.content(options)
  }

  return withTimeoutOption(cat)
}
