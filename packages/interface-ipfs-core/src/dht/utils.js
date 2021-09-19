

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'

/**
 * @param {Uint8Array} [data]
 * @returns
 */
export async function fakeCid (data) {
  const bytes = data || uint8ArrayFromString(`TEST${Math.random()}`)
  const mh = await sha256.digest(bytes)
  return CID.createV0(mh)
}
