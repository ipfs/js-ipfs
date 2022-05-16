import { logger } from '@libp2p/logger'
import {
  MFS_ROOT_KEY
} from '../../../utils.js'
import errCode from 'err-code'

const log = logger('ipfs:mfs:utils:update-mfs-root')

/**
 * @typedef {import('../').MfsContext} MfsContext
 */

/**
 * @param {MfsContext} context
 * @param {import('multiformats/cid').CID} cid
 * @param {import('ipfs-core-types/src/utils').AbortOptions} options
 */
export async function updateMfsRoot (context, cid, options) {
  if (options && options.signal && options.signal.aborted) {
    throw errCode(new Error('Request aborted'), 'ERR_ABORTED', { name: 'Aborted' })
  }

  log(`New MFS root will be ${cid}`)

  await context.repo.datastore.put(MFS_ROOT_KEY, cid.bytes)

  return cid
}
