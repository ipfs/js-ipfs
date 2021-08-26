'use strict'

const { UnixFS } = require('ipfs-unixfs')
const dagPb = require('@ipld/dag-pb')
const { CID } = require('multiformats/cid')

/**
 * @typedef {import('ipfs-unixfs').MtimeLike} MtimeLike
 * @typedef {import('multiformats/cid').CIDVersion} CIDVersion
 * @typedef {import('../').MfsContext} MfsContext
 */

/**
 * @param {MfsContext} context
 * @param {'file' | 'directory'} type
 * @param {object} options
 * @param {string} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 * @param {MtimeLike} [options.mtime]
 * @param {number} [options.mode]
 */
const createNode = async (context, type, options) => {
  const metadata = new UnixFS({
    type,
    mode: options.mode,
    // @ts-ignore TODO: restore hrtime support to ipfs-unixfs constructor - it's in the code, just not the signature
    mtime: options.mtime
  })

  // Persist the new parent PBNode
  const hasher = await context.hashers.getHasher(options.hashAlg)
  const node = {
    Data: metadata.marshal(),
    Links: []
  }
  const buf = dagPb.encode(node)
  const hash = await hasher.digest(buf)
  const cid = CID.create(options.cidVersion, dagPb.code, hash)

  if (options.flush) {
    await context.repo.blocks.put(cid, buf)
  }

  return {
    cid,
    node
  }
}

module.exports = createNode
