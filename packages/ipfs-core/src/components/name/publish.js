import { logger } from '@libp2p/logger'
import parseDuration from 'parse-duration'
import { importKey, unmarshalPrivateKey } from '@libp2p/crypto/keys'
import errcode from 'err-code'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { OFFLINE_ERROR, normalizePath } from '../../utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { resolvePath } from './utils.js'
import { peerIdFromKeys } from '@libp2p/peer-id'

const log = logger('ipfs:name:publish')

/**
 * IPNS - Inter-Planetary Naming System
 *
 * @param {object} config
 * @param {import('../ipns').IPNSAPI} config.ipns
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 * @param {import('@libp2p/interface-peer-id').PeerId} config.peerId
 * @param {import('ipfs-core-types/src/root').API<{}>["isOnline"]} config.isOnline
 * @param {import('@libp2p/interface-keychain').KeyChain} config.keychain
 */
export function createPublish ({ ipns, repo, codecs, peerId, isOnline, keychain }) {
  /**
   * @param {string} keyName
   */
  const lookupKey = async keyName => {
    /** @type {import('@libp2p/interface-keys').PrivateKey} */
    let privateKey

    if (keyName === 'self' && peerId.privateKey != null) {
      privateKey = await unmarshalPrivateKey(peerId.privateKey)
    } else {
      try {
        // We're exporting and immediately importing the key, so we can just use a throw away password
        const pem = await keychain.exportKey(keyName, 'temp')
        privateKey = await importKey(pem, 'temp')
      } catch (/** @type {any} */ err) {
        log.error(err)
        throw errcode(err, 'ERR_CANNOT_GET_KEY')
      }
    }

    return peerIdFromKeys(privateKey.public.bytes, privateKey.bytes)
  }

  /**
   * @type {import('ipfs-core-types/src/name').API<{}>["publish"]}
   */
  async function publish (value, options = {}) {
    const resolve = !(options.resolve === false)
    const lifetime = options.lifetime || '24h'
    const key = options.key || 'self'

    if (!isOnline()) {
      throw errcode(new Error(OFFLINE_ERROR), 'OFFLINE_ERROR')
    }

    // TODO: params related logic should be in the core implementation
    // Normalize path value
    try {
      value = normalizePath(value)
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw err
    }

    let pubLifetime = 0
    try {
      pubLifetime = parseDuration(lifetime) || 0

      // Calculate lifetime with nanoseconds precision
      pubLifetime = parseFloat(pubLifetime.toFixed(6))
    } catch (/** @type {any} */ err) {
      log.error(err)
      throw err
    }

    // TODO: ttl human for cache
    const results = await Promise.all([
      // verify if the path exists, if not, an error will stop the execution
      lookupKey(key),
      // if resolving, do a get so we make sure we have the blocks
      resolve ? resolvePath({ ipns, repo, codecs }, value) : Promise.resolve()
    ])

    const bytes = uint8ArrayFromString(value)

    // Start publishing process
    const result = await ipns.publish(results[0], bytes, pubLifetime, options)

    return {
      name: result.name,
      value: uint8ArrayToString(result.value)
    }
  }

  return withTimeoutOption(publish)
}
