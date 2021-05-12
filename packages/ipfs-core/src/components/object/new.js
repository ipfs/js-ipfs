'use strict'

const {
  DAGNode
} = require('ipld-dag-pb')
const multicodec = require('multicodec')
const mh = require('multihashing-async').multihash
const { UnixFS } = require('ipfs-unixfs')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
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
    } else {
      data = new Uint8Array(0)
    }

    const node = new DAGNode(data)

    const cid = await ipld.put(node, multicodec.DAG_PB, {
      cidVersion: 0,
      hashAlg: mh.names['sha2-256'],
      signal: options.signal
    })

    if (options.preload !== false) {
      preload(cid)
    }

    return cid
  }

  return withTimeoutOption(_new)
}
