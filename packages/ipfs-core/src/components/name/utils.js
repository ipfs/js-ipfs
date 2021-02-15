'use strict'

const isIPFS = require('is-ipfs')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')
const drain = require('it-drain')

/**
 * resolves the given path by parsing out protocol-specific entries
 * (e.g. /ipns/<node-key>) and then going through the /ipfs/ entries and returning the final node
 *
 * @param {Object} context
 * @param {import('../ipns')} context.ipns
 * @param {import('ipld')} context.ipld
 * @param {string} name
 */
exports.resolvePath = async ({ ipns, ipld }, name) => {
  // ipns path
  if (isIPFS.ipnsPath(name)) {
    return ipns.resolve(name)
  }

  const {
    cid,
    path
  } = toCidAndPath(name)

  // ipfs path
  await drain(ipld.resolve(cid, path || ''))
}
