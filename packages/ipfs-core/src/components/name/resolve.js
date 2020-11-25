'use strict'

const debug = require('debug')
const errcode = require('err-code')
const { mergeOptions } = require('../../utils')
const CID = require('cids')
const isDomain = require('is-domain-name')

const log = Object.assign(debug('ipfs:name:resolve'), {
  error: debug('ipfs:name:resolve:error')
})

const { OFFLINE_ERROR } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 *
 * @param {string} result
 * @param {string[]} remainder
 * @returns {string}
 */
const appendRemainder = (result, remainder) =>
  remainder.length > 0
    ? result + '/' + remainder.join('/')
    : result

/**
 * IPNS - Inter-Planetary Naming System
 *
 * @param {Object} config
 * @param {import('.').DNS} config.dns
 * @param {import('.').IPNS} config.ipns
 * @param {import('.').PeerId} config.peerId
 * @param {import('.').IsOnline} config.isOnline
 * @param {ResolveOptions} config.options
 */
module.exports = ({ dns, ipns, peerId, isOnline, options: { offline } }) => {
  /**
   * Given a key, query the DHT for its best value.
   *
   * @param {string} name - ipns name to resolve. Defaults to your node's peerID.
   * @param {Options & AbortOptions} [options]
   * @returns {AsyncIterable<string>}
   * @example
   * ```js
   * // The IPNS address you want to resolve.
   * const addr = '/ipns/ipfs.io'
   *
   * for await (const name of ipfs.name.resolve(addr)) {
   *   console.log(name)
   * }
   * // Logs: /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
   * ```
   */
  async function * resolve (name, options = {}) { // eslint-disable-line require-await
    options = mergeOptions({
      nocache: false,
      recursive: true
    }, options)

    // TODO: params related logic should be in the core implementation
    if (offline && options && options.nocache) {
      throw errcode(new Error('cannot specify both offline and nocache'), 'ERR_NOCACHE_AND_OFFLINE')
    }

    // Set node id as name for being resolved, if it is not received
    if (!name) {
      name = peerId.toB58String()
    }

    if (!name.startsWith('/ipns/')) {
      name = `/ipns/${name}`
    }

    const [namespace, hash, ...remainder] = name.slice(1).split('/')
    try {
      new CID(hash) // eslint-disable-line no-new
    } catch (err) {
      // lets check if we have a domain ex. /ipns/ipfs.io and resolve with dns
      if (isDomain(hash)) {
        yield appendRemainder(await dns(hash, options), remainder)
        return
      }

      log.error(err)
      throw errcode(new Error('Invalid IPNS name'), 'ERR_IPNS_INVALID_NAME')
    }

    // multihash is valid lets resolve with IPNS
    // IPNS resolve needs a online daemon
    if (!isOnline() && !offline) {
      throw errcode(new Error(OFFLINE_ERROR), 'OFFLINE_ERROR')
    }

    // TODO: convert ipns.resolve to return an iterator
    yield appendRemainder(await ipns.resolve(`/${namespace}/${hash}`, options), remainder)
  }

  return withTimeoutOption(resolve)
}

/**
 * IPFS resolve options.
 *
 * @typedef {Object} Options
 * @property {boolean} [options.nocache=false] - do not use cached entries.
 * @property {boolean} [options.recursive=true] - resolve until the result is not an IPNS name.
 *
 * @typedef {Object} ResolveOptions
 * @property {boolean} [offline]
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
