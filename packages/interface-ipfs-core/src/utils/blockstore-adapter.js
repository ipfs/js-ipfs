'use strict'

const { BlockstoreAdapter } = require('interface-blockstore')
const raw = require('multiformats/codecs/raw')
const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const { sha256 } = require('multiformats/hashes/sha2')
const uint8ArrayToString = require('uint8arrays/to-string')

/**
 * @type {Record<number, string>}
 */
const formats = {
  [raw.code]: raw.name,
  [dagPb.code]: dagPb.name,
  [dagCbor.code]: dagCbor.name
}

/**
 * @type {Record<number, string>}
 */
const hashes = {
  [sha256.code]: sha256.name
}

class IPFSBlockstore extends BlockstoreAdapter {
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
module.exports = (ipfs) => {
  return new IPFSBlockstore(ipfs)
}
