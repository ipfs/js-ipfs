import { CID } from 'multiformats/cid'

/**
 * @param {string|Uint8Array|CID} cid
 */
export function cleanCid (cid) {
  if (cid instanceof Uint8Array) {
    return CID.decode(cid)
  }

  return CID.parse(cid.toString())
}
