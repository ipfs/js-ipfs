import { CID } from 'multiformats/cid'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 * @param {import('ipfs-core-utils/multihashes').Multihashes} config.hashers
 * @param {import('../../types').Preload} config.preload
 */
export function createPut ({ repo, codecs, hashers, preload }) {
  /**
   * @type {import('ipfs-core-types/src/dag').API<{}>["put"]}
   */
  async function put (dagNode, options = {}) {
    const release = options.pin ? await repo.gcLock.readLock() : null

    try {
      const storeCodec = await codecs.getCodec(options.storeCodec || 'dag-cbor')
      // TODO: doesn't getCodec throw? verify and possibly remove this
      if (!storeCodec) {
        throw new Error(`Unknown storeCodec ${options.storeCodec}, please configure additional BlockCodecs for this IPFS instance`)
      }

      if (options.inputCodec) {
        if (!(dagNode instanceof Uint8Array)) {
          throw new Error('Can only inputCodec on raw bytes that can be decoded')
        }
        const inputCodec = await codecs.getCodec(options.inputCodec)
        if (!inputCodec) {
          throw new Error(`Unknown inputCodec ${options.inputCodec}, please configure additional BlockCodecs for this IPFS instance`)
        }
        dagNode = inputCodec.decode(dagNode)
      }

      const cidVersion = options.version != null ? options.version : 1
      const hasher = await hashers.getHasher(options.hashAlg || 'sha2-256')

      if (!hasher) {
        throw new Error(`Unknown hash algorithm ${options.hashAlg}, please configure additional MultihashHashers for this IPFS instance`)
      }

      const buf = storeCodec.encode(dagNode)
      const hash = await hasher.digest(buf)
      const cid = CID.create(cidVersion, storeCodec.code, hash)

      await repo.blocks.put(cid, buf, {
        signal: options.signal
      })

      if (options.pin) {
        await repo.pins.pinRecursively(cid)
      }

      if (options.preload !== false) {
        preload(cid)
      }

      return cid
    } finally {
      if (release) {
        release()
      }
    }
  }

  return withTimeoutOption(put)
}
