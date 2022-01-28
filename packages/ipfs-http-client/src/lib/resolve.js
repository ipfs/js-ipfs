import { CID } from 'multiformats/cid'
import errCode from 'err-code'

/**
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * Retrieves IPLD Nodes along the `path` that is rooted at `cid`.
 *
 * @param {CID} cid - the CID where the resolving starts
 * @param {string} path - the path that should be resolved
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @param {(cid: CID, options?: AbortOptions) => Promise<Uint8Array>} getBlock
 * @param {AbortOptions} [options]
 */
export async function * resolve (cid, path, codecs, getBlock, options) {
  /**
   * @param {CID} cid
   */
  const load = async (cid) => {
    const codec = await codecs.getCodec(cid.code)
    const block = await getBlock(cid, options)

    return codec.decode(block)
  }

  const parts = path.split('/').filter(Boolean)
  let value = await load(cid)
  let lastCid = cid

  // End iteration if there isn't a CID to follow any more
  while (parts.length) {
    const key = parts.shift()

    if (!key) {
      throw errCode(new Error(`Could not resolve path "${path}"`), 'ERR_INVALID_PATH')
    }

    if (Object.prototype.hasOwnProperty.call(value, key)) {
      value = value[key]

      yield {
        value,
        remainderPath: parts.join('/')
      }
    } else {
      throw errCode(new Error(`no link named "${key}" under ${lastCid}`), 'ERR_NO_LINK')
    }

    const cid = CID.asCID(value)

    if (cid) {
      lastCid = cid
      value = await load(value)
    }
  }

  yield {
    value,
    remainderPath: ''
  }
}
