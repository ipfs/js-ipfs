'use strict'

const isIPFS = require('is-ipfs')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')
const drain = require('it-drain')
const { resolve } = require('../../utils')

/**
 * resolves the given path by parsing out protocol-specific entries
 * (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
 *
 * @param {Object} context
 * @param {import('../ipns')} context.ipns
 * @param {import('ipfs-repo').IPFSRepo} context.repo
 * @param {import('ipfs-core-utils/src/multicodecs')} context.codecs
 * @param {string} name
 * @param {import('ipfs-core-types/src/utils').AbortOptions} [options]
 */
exports.resolvePath = async ({ ipns, repo, codecs }, name, options) => {
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
