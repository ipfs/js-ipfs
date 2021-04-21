'use strict'

const { UnixFS } = require('ipfs-unixfs')
const {
  DAGNode
} = require('ipld-dag-pb')
const mc = require('multicodec')
const mh = require('multihashing-async').multihash

/**
 * @typedef {import('ipfs-unixfs').MtimeLike} MtimeLike
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('../').MfsContext} MfsContext
 */

/**
 * @param {MfsContext} context
 * @param {'file' | 'directory'} type
 * @param {object} options
 * @param {import('multihashes').HashName} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {MtimeLike} [options.mtime]
 * @param {number} [options.mode]
 */
const createNode = async (context, type, options) => {
  const hashAlg = mh.names[options.hashAlg]
  const metadata = new UnixFS({
    type,
    mode: options.mode,
    // @ts-ignore TODO: restore hrtime support to ipfs-unixfs constructor - it's in the code, just not the signature
    mtime: options.mtime
  })

  const node = new DAGNode(metadata.marshal())
  const cid = await context.ipld.put(node, mc.DAG_PB, {
    cidVersion: options.cidVersion,
    hashAlg,
    onlyHash: !options.flush
  })

  return {
    cid,
    node
  }
}

module.exports = createNode
