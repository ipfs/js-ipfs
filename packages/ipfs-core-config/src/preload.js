import HTTP from 'ipfs-utils/src/http.js'
import { logger } from '@libp2p/logger'
import drain from 'it-drain'

const log = logger('ipfs:preload')

/**
 * @param {string} url
 * @param {import('ipfs-core-types/src/utils').AbortOptions} options
 */
export async function preload (url, options = {}) {
  log(url)

  const res = await HTTP.post(url, { signal: options.signal })

  if (res.body) {
    // Read to completion but do not cache
    // @ts-expect-error
    await drain(res.body)
  }
}
