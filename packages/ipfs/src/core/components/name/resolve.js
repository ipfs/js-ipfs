'use strict'

const debug = require('debug')
const errcode = require('err-code')
const mergeOptions = require('merge-options')
const CID = require('cids')
const isDomain = require('is-domain-name')

const log = debug('ipfs:name:resolve')
log.error = debug('ipfs:name:resolve:error')

const { OFFLINE_ERROR } = require('../../utils')

const appendRemainder = async (result, remainder) => {
  result = await result

  if (remainder.length) {
    return result + '/' + remainder.join('/')
  }

  return result
}

/**
 * @typedef { import("../index") } IPFS
 */

/**
 * IPNS - Inter-Planetary Naming System
 *
 * @param {IPFS} self
 * @returns {Object}
 */
module.exports = ({ dns, ipns, peerId, isOnline, options: constructorOptions }) => {
  /**
   * Given a key, query the DHT for its best value.
   *
   * @param {String} name ipns name to resolve. Defaults to your node's peerID.
   * @param {Object} options ipfs resolve options.
   * @param {boolean} options.nocache do not use cached entries.
   * @param {boolean} options.recursive resolve until the result is not an IPNS name.
   * @param {function(Error)} [callback]
   * @returns {Promise|void}
   */
  return async function * resolve (name, options) { // eslint-disable-line require-await
    options = mergeOptions({
      nocache: false,
      recursive: true
    }, options || {})

    const { offline } = constructorOptions

    // TODO: params related logic should be in the core implementation
    if (offline && options.nocache) {
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
        yield appendRemainder(dns(hash, options), remainder)
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
    yield appendRemainder(ipns.resolve(`/${namespace}/${hash}`, options), remainder)
  }
}
