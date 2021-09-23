import { CID } from 'multiformats/cid'
import errCode from 'err-code'

const IPFS_PREFIX = '/ipfs/'

/**
 * @param {string|Uint8Array|CID} string
 * @returns {{cid:CID, path?:string}}
 */
export function toCidAndPath (string) {
  if (string instanceof Uint8Array) {
    try {
      string = CID.decode(string)
    } catch (/** @type {any} */ err) {
      throw errCode(err, 'ERR_INVALID_CID')
    }
  }

  let cid = CID.asCID(string)

  if (cid) {
    return {
      cid,
      path: undefined
    }
  }

  string = string.toString()

  if (string.startsWith(IPFS_PREFIX)) {
    string = string.substring(IPFS_PREFIX.length)
  }

  const parts = string.split('/')
  let path

  try {
    cid = CID.parse(parts.shift() || '')
  } catch (/** @type {any} */ err) {
    throw errCode(err, 'ERR_INVALID_CID')
  }

  if (parts.length) {
    path = `/${parts.join('/')}`
  }

  return {
    cid,
    path
  }
}
