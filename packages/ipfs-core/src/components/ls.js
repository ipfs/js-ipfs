import { exporter } from 'ipfs-unixfs-exporter'
import errCode from 'err-code'
import { normalizeCidPath, mapFile } from '../utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { CID } from 'multiformats/cid'

/**
 * @typedef {object} Context
 * @property {import('ipfs-repo').IPFSRepo} repo
 * @property {import('../types').Preload} preload
 *
 * @param {Context} context
 */
export function createLs ({ repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["ls"]}
   */
  async function * ls (ipfsPath, options = {}) {
    const legacyPath = normalizeCidPath(ipfsPath)
    const pathComponents = legacyPath.split('/')

    if (options.preload !== false) {
      preload(CID.parse(pathComponents[0]))
    }

    const ipfsPathOrCid = CID.asCID(legacyPath) || legacyPath
    const file = await exporter(ipfsPathOrCid, repo.blocks, options)

    if (file.type === 'file') {
      yield mapFile(file)
      return
    }

    if (file.type === 'directory') {
      for await (const child of file.content()) {
        yield mapFile(child)
      }

      return
    }

    throw errCode(new Error(`Unknown UnixFS type ${file.type}`), 'ERR_UNKNOWN_UNIXFS_TYPE')
  }

  return withTimeoutOption(ls)
}
