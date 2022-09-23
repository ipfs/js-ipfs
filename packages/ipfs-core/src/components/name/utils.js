import * as isIPFS from 'is-ipfs'
import { toCidAndPath } from 'ipfs-core-utils/to-cid-and-path'
import drain from 'it-drain'
import { resolve } from '../../utils.js'

/**
 * resolves the given path by parsing out protocol-specific entries
 * (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
 *
 * @param {object} context
 * @param {import('../ipns').IPNSAPI} context.ipns
 * @param {import('ipfs-repo').IPFSRepo} context.repo
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} context.codecs
 * @param {string} name
 * @param {import('ipfs-core-types/src/utils').AbortOptions} [options]
 */
export async function resolvePath ({ ipns, repo, codecs }, name, options) {
  // ipns path
  if (isIPFS.ipnsPath(name)) {
    return ipns.resolve(name)
  }

  const {
    cid,
    path
  } = toCidAndPath(name)

  // ipfs path
  await drain(resolve(cid, path || '', codecs, repo, options))
}
