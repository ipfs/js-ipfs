import { UnixFS } from 'ipfs-unixfs'
import * as dagPB from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'

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
export async function createNode (context, type, options) {
  const metadata = new UnixFS({
    type,
    mode: options.mode,
    mtime: options.mtime
  })

  // Persist the new parent PBNode
  const hasher = await context.hashers.getHasher(options.hashAlg)
  const node = {
    Data: metadata.marshal(),
    Links: []
  }
  const buf = dagPB.encode(node)
  const hash = await hasher.digest(buf)
  const cid = CID.create(options.cidVersion, dagPB.code, hash)

  if (options.flush) {
    await context.repo.blocks.put(cid, buf)
  }

  return {
    cid,
    node
  }
}
