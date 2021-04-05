'use strict'

const { UnixFS } = require('ipfs-unixfs')
// @ts-ignore - TODO vmx 2021-03-31
const dagPb = require('@ipld/dag-pb')
const Block = require('multiformats/block')
const { sha256, sha512 } = require('multiformats/hashes/sha2')

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
  const metadata = new UnixFS({
    type,
    mode: options.mode,
    // @ts-ignore TODO: restore hrtime support to ipfs-unixfs constructor - it's in the code, just not the signature
    mtime: options.mtime
  })

  let hasher
  switch (options.hashAlg) {
    case 'sha2-256':
      hasher = sha256
      break
    case 'sha2-512':
      hasher = sha512
      break
    default:
      throw new Error(`TODO vmx 2021-03-31: Proper error message for unsupported hash algorithms like ${options.hashAlg}`)
  }

  const node = dagPb.prepare({ Data: metadata.marshal() })
  const block = await Block.encode({
    value: node,
    codec: dagPb,
    hasher
  })
  if (options.flush) {
    await context.blockStorage.put(block)
  }

  let cid = block.cid
  if (options.cidVersion === 0) {
    cid = cid.toV0()
  }

  return {
    cid,
    node
  }
}

module.exports = createNode
