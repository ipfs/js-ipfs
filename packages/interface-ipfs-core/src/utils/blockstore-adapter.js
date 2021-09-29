import { BaseBlockstore } from 'blockstore-core/base'
import * as raw from 'multiformats/codecs/raw'
import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

/**
 * @type {Record<number, string>}
 */
const formats = {
  [raw.code]: raw.name,
  [dagPB.code]: dagPB.name,
  [dagCBOR.code]: dagCBOR.name
}

/**
 * @type {Record<number, string>}
 */
const hashes = {
  [sha256.code]: sha256.name
}

class IPFSBlockstore extends BaseBlockstore {
  /**
   * @param {import('ipfs-core-types').IPFS} ipfs
   */
  constructor (ipfs) {
    super()

    this.ipfs = ipfs
  }

  /**
   * @param {import('multiformats/cid').CID} cid
   * @param {Uint8Array} buf
   */
  async put (cid, buf) {
    const c = await this.ipfs.block.put(buf, {
      format: formats[cid.code],
      mhtype: hashes[cid.multihash.code],
      version: cid.version
    })

    if (uint8ArrayToString(c.multihash.bytes, 'base64') !== uint8ArrayToString(cid.multihash.bytes, 'base64')) {
      throw new Error('Multihashes of stored blocks did not match')
    }
  }
}

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
export default function createBlockstore (ipfs) {
  return new IPFSBlockstore(ipfs)
}
