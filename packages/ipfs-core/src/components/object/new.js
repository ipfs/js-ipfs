'use strict'

const dagPb = require('@ipld/dag-pb')
const { sha256 } = require('multiformats/hashes/sha2')
const { UnixFS } = require('ipfs-unixfs')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { CID } = require('multiformats/cid')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ repo, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/object').API["new"]}
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

    const buf = dagPb.encode({
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
