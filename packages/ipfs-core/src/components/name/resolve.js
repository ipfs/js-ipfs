'use strict'

const debug = require('debug')
const errcode = require('err-code')
const { mergeOptions } = require('../../utils')
const CID = require('cids')
// @ts-ignore no types
const isDomain = require('is-domain-name')
const uint8ArrayToString = require('uint8arrays/to-string')

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
 * @param {import('ipfs-core-types/src/root').API["dns"]} config.dns
 * @param {import('../ipns')} config.ipns
 * @param {import('peer-id')} config.peerId
 * @param {import('ipfs-core-types/src/root').API["isOnline"]} config.isOnline
 * @param {import('../../types').Options} config.options
 */
module.exports = ({ dns, ipns, peerId, isOnline, options: { offline } }) => {
  /**
   * @type {import('ipfs-core-types/src/name').API["resolve"]}
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
    const value = await ipns.resolve(`/${namespace}/${hash}`, options)
    yield appendRemainder(value instanceof Uint8Array ? uint8ArrayToString(value) : value, remainder)
  }

  return withTimeoutOption(resolve)
}
