import { CID } from 'multiformats/cid'
import { UnixFS } from 'ipfs-unixfs'
import * as dagPB from '@ipld/dag-pb'
import { sha256 } from 'multiformats/hashes/sha2'
import { logger } from '@libp2p/logger'
import errCode from 'err-code'
import { MFS_ROOT_KEY } from '../../../utils.js'

const log = logger('ipfs:mfs:utils:with-mfs-root')

/**
 * @typedef {import('../').MfsContext} MfsContext
 */

/**
 * @param {MfsContext} context
 * @param {import('ipfs-core-types/src/utils').AbortOptions} [options]
 */
export async function loadMfsRoot (context, options) {
  if (options && options.signal && options.signal.aborted) {
    throw errCode(new Error('Request aborted'), 'ERR_ABORTED', { name: 'Aborted' })
  }

  // Open the repo if it's been closed
  await context.repo.datastore.open()

  // Load the MFS root CID
  let cid

  try {
    const buf = await context.repo.datastore.get(MFS_ROOT_KEY)

    cid = CID.decode(buf)
  } catch (/** @type {any} */ err) {
    if (err.code !== 'ERR_NOT_FOUND') {
      throw err
    }

    log('Creating new MFS root')
    const buf = dagPB.encode({
      Data: new UnixFS({ type: 'directory' }).marshal(),
      Links: []
    })
    const hash = await sha256.digest(buf)
    cid = CID.createV0(hash)
    await context.repo.blocks.put(cid, buf)

    if (options && options.signal && options.signal.aborted) {
      throw errCode(new Error('Request aborted'), 'ERR_ABORTED', { name: 'Aborted' })
    }

    await context.repo.datastore.put(MFS_ROOT_KEY, cid.bytes)
  }

  log(`Loaded MFS root /ipfs/${cid}`)

  return cid
}
