import { logger } from '@libp2p/logger'
import errcode from 'err-code'
import mergeOpts from 'merge-options'
import { CID } from 'multiformats/cid'
import * as Digest from 'multiformats/hashes/digest'
import { base36 } from 'multiformats/bases/base36'
import { peerIdFromString } from '@libp2p/peer-id'
// @ts-expect-error no types
import isDomain from 'is-domain-name'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { OFFLINE_ERROR } from '../../utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

const log = logger('ipfs:name:resolve')

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
 * @param {object} config
 * @param {import('ipfs-core-types/src/root').API<{}>["dns"]} config.dns
 * @param {import('../ipns').IPNSAPI} config.ipns
 * @param {import('ipfs-core-types/src/root').API<{}>["isOnline"]} config.isOnline
 * @param {import('../../types').Options} config.options
 */
export function createResolve ({ dns, ipns, isOnline, options: { offline } }) {
  /**
   * @type {import('ipfs-core-types/src/name').API<{}>["resolve"]}
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

    // IPNS resolve needs a online daemon
    if (!isOnline() && !offline) {
      throw errcode(new Error(OFFLINE_ERROR), 'OFFLINE_ERROR')
    }

    let ipnsName = name.toString()

    if (!ipnsName.startsWith('/ipns/')) {
      ipnsName = `/ipns/${ipnsName}`
    }

    let [namespace, hash, ...remainder] = ipnsName.slice(1).split('/')

    try {
      if (hash.substring(0, 1) === '1') {
        const id = peerIdFromString(hash)
        const digest = Digest.decode(id.toBytes())
        const libp2pKey = CID.createV1(0x72, digest)
        hash = libp2pKey.toString(base36)
      } else {
        const cid = CID.parse(hash)

        if (cid.version === 1) {
          hash = cid.toString(base36)
        }
      }
    } catch (/** @type {any} */ err) {
      // lets check if we have a domain ex. /ipns/ipfs.io and resolve with dns
      if (isDomain(hash)) {
        yield appendRemainder(await dns(hash, options), remainder)
        return
      }

      log.error(err)
      throw errcode(new Error('Invalid IPNS name'), 'ERR_IPNS_INVALID_NAME')
    }

    // multihash is valid lets resolve with IPNS
    // TODO: convert ipns.resolve to return an iterator
    const value = await ipns.resolve(`/${namespace}/${hash}`, options)
    yield appendRemainder(value instanceof Uint8Array ? uint8ArrayToString(value) : value, remainder)
  }

  return withTimeoutOption(resolve)
}
