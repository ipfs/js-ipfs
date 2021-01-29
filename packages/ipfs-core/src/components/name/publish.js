'use strict'

const debug = require('debug')
const { default: parseDuration } = require('parse-duration')
const crypto = require('libp2p-crypto')
const errcode = require('err-code')

const log = Object.assign(debug('ipfs:name:publish'), {
  error: debug('ipfs:name:publish:error')
})

const { OFFLINE_ERROR, normalizePath } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { resolvePath } = require('./utils')

/**
 * IPNS - Inter-Planetary Naming System
 *
 * @param {Object} config
 * @param {import('.').IPNS} config.ipns
 * @param {import('.').DagReader} config.dagReader
 * @param {import('.').PeerId} config.peerId
 * @param {import('.').IsOnline} config.isOnline
 * @param {import('.').Keychain} config.keychain
 */
module.exports = ({ ipns, dagReader, peerId, isOnline, keychain }) => {
  const lookupKey = async keyName => {
    if (keyName === 'self') {
      return peerId.privKey
    }

    try {
      // We're exporting and immediately importing the key, so we can just use a throw away password
      const pem = await keychain.exportKey(keyName, 'temp')
      const privateKey = await crypto.keys.import(pem, 'temp')
      return privateKey
    } catch (err) {
      log.error(err)
      throw errcode(err, 'ERR_CANNOT_GET_KEY')
    }
  }

  /**
   * IPNS is a PKI namespace, where names are the hashes of public keys, and
   * the private key enables publishing new (signed) values. In both publish
   * and resolve, the default name used is the node's own PeerID,
   * which is the hash of its public key.
   *
   * @param {string} value - ipfs path of the object to be published.
   * @param {PublishOptions} [options]
   * @returns {Promise<PublishResult>}
   * @example
   * ```js
   * // The address of your files.
   * const addr = '/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp'
   * const res = await ipfs.name.publish(addr)
   * // You now have a res which contains two fields:
   * //   - name: the name under which the content was published.
   * //   - value: the "real" address to which Name points.
   * console.log(`https://gateway.ipfs.io/ipns/${res.name}`)
   * ```
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
    } catch (err) {
      log.error(err)
      throw err
    }

    let pubLifetime = 0
    try {
      pubLifetime = parseDuration(lifetime) || 0

      // Calculate lifetime with nanoseconds precision
      pubLifetime = parseFloat(pubLifetime.toFixed(6))
    } catch (err) {
      log.error(err)
      throw err
    }

    // TODO: ttl human for cache
    const results = await Promise.all([
      // verify if the path exists, if not, an error will stop the execution
      lookupKey(key),
      resolve ? resolvePath({ ipns, dagReader }, value) : Promise.resolve()
    ])

    // Start publishing process
    return ipns.publish(results[0], value, pubLifetime)
  }

  return withTimeoutOption(publish)
}

/**
 * @typedef {PublishSettings & AbortOptions} PublishOptions
 * ipfs publish options.
 *
 * @typedef {Object} PublishSettings
 * @property {boolean} [resolve=true] - Resolve given path before publishing.
 * @property {string} [lifetime='24h'] - Time duration of the record.
 * @property {string} [ttl] - Time duration this record should be cached.
 * @property {string} [key=self] - Name of the key to be used.
 * @property {boolean} [allowOffline=true] - When offline, save the IPNS record
 * to the the local datastore without broadcasting to the network instead of
 * simply failing.
 *
 * This option is not yet implemented in js-ipfs. See tracking issue [ipfs/js-ipfs#1997]
 * (https://github.com/ipfs/js-ipfs/issues/1997).
 *
 * @typedef {Object} PublishResult
 * @property {string} name
 * @property {string} value
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
