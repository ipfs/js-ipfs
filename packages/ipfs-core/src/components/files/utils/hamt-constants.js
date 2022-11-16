import { murmur3128 } from '@multiformats/murmur3'

export const hamtHashCode = murmur3128.code
export const hamtBucketBits = 8

/**
 * @param {Uint8Array} buf
 */
export async function hamtHashFn (buf) {
  return (await murmur3128.encode(buf))
    // Murmur3 outputs 128 bit but, accidentally, IPFS Go's
    // implementation only uses the first 64, so we must do the same
    // for parity..
    .subarray(0, 8)
    // Invert buffer because that's how Go impl does it
    .reverse()
}
