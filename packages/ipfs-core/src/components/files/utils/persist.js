'use strict'

const { CID } = require('multiformats/cid')
const dagPb = require('@ipld/dag-pb')
const { sha256 } = require('multiformats/hashes/sha2')

/**
 * @typedef {object} PersistOptions
 * @property {import('multiformats/codecs/interface').BlockCodec<any, any>} [codec]
 * @property {import('multiformats/hashes/interface').MultihashHasher} [hasher]
 * @property {import('multiformats/cid').CIDVersion} [cidVersion]
 * @property {boolean} [onlyHash]
 * @property {AbortSignal} [signal]
 */

/**
 * @param {Uint8Array} buffer
 * @param {import('interface-blockstore').Blockstore} blockstore
 * @param {PersistOptions} options
 */
const persist = async (buffer, blockstore, options) => {
  if (!options.codec) {
    options.codec = dagPb
  }

  if (!options.hasher) {
    options.hasher = sha256
  }

  if (options.cidVersion === undefined) {
    options.cidVersion = 1
  }

  if (options.codec === dagPb && options.hasher !== sha256) {
    options.cidVersion = 1
  }

  const multihash = await options.hasher.digest(buffer)
  const cid = CID.create(options.cidVersion, options.codec.code, multihash)

  if (!options.onlyHash) {
    await blockstore.put(cid, buffer, {
      signal: options.signal
    })
  }

  return cid
}

module.exports = persist
