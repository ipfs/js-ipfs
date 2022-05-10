import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { base64url } from 'multiformats/bases/base64'

/* HTTP RPC:
 * - wraps binary data in multibase. base64url is used to avoid issues
 *   when a binary data is passed as search param in URL.
 *   Historical context: https://github.com/ipfs/go-ipfs/issues/7939
 *   Multibase wrapping introduced in: https://github.com/ipfs/go-ipfs/pull/8183
 */

/**
 * @param {Array<string>} strings
 * @returns {Array<string>} strings
 */
const rpcArrayToTextArray = strings => {
  if (Array.isArray(strings)) {
    return strings.map(rpcToText)
  }
  return strings
}

/**
 * @param {string} mb
 * @returns {string}
 */
const rpcToText = mb => uint8ArrayToString(rpcToBytes(mb))

/**
 * @param {string} mb
 * @returns {Uint8Array}
 */
const rpcToBytes = mb => base64url.decode(mb)

/**
 * @param {string} mb
 * @returns {bigint}
 */
const rpcToBigInt = mb => BigInt(`0x${uint8ArrayToString(base64url.decode(mb), 'base16')}`)

/**
 * @param {string} text
 * @returns {string}
 */
const textToUrlSafeRpc = text => base64url.encode(uint8ArrayFromString(text))

export { rpcArrayToTextArray, rpcToText, rpcToBytes, rpcToBigInt, textToUrlSafeRpc }
