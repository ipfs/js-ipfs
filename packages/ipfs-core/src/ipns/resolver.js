import * as ipns from 'ipns'
import { peerIdFromString } from '@libp2p/peer-id'
import errcode from 'err-code'
import { logger } from '@libp2p/logger'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import * as Errors from 'datastore-core/errors'
import { ipnsValidator } from 'ipns/validator'

/**
 * @typedef {import('@libp2p/interface-peer-id').PeerId} PeerId
 * @typedef {import('@libp2p/interfaces').AbortOptions} AbortOptions
 */

const log = logger('ipfs:ipns:resolver')

const ERR_NOT_FOUND = Errors.notFoundError().code

const defaultMaximumRecursiveDepth = 32

export class IpnsResolver {
  /**
   * @param {import('ipfs-core-types/src/utils').BufferStore} routing
   */
  constructor (routing) {
    this._routing = routing
  }

  /**
   * @param {string} name
   * @param {object} [options]
   * @param {boolean} [options.recursive]
   * @param {AbortSignal} [options.signal]
   */
  async resolve (name, options = {}) {
    if (typeof name !== 'string') {
      throw errcode(new Error('invalid name'), 'ERR_INVALID_NAME')
    }

    const recursive = options.recursive && options.recursive.toString() === 'true'

    const nameSegments = name.split('/')

    if (nameSegments.length !== 3 || nameSegments[0] !== '') {
      throw errcode(new Error('invalid name'), 'ERR_INVALID_NAME')
    }

    const key = nameSegments[2]

    // Define a maximum depth if recursive option enabled
    let depth = Infinity

    if (recursive) {
      depth = defaultMaximumRecursiveDepth
    }

    const res = await this.resolver(key, depth, options)

    log(`${name} was locally resolved correctly`)
    return res
  }

  /**
   * Recursive resolver according to the specified depth
   *
   * @param {string} name
   * @param {number} depth
   * @param {AbortOptions} options
   * @returns {Promise<string>}
   */
  async resolver (name, depth, options) {
    // Exceeded recursive maximum depth
    if (depth === 0) {
      const errMsg = `could not resolve name (recursion limit of ${defaultMaximumRecursiveDepth} exceeded)`
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_RESOLVE_RECURSION_LIMIT')
    }

    const res = await this._resolveName(name, options)
    const nameSegments = res.split('/')

    // If obtained a ipfs cid or recursive option is disabled
    if (nameSegments[1] === 'ipfs' || !depth) {
      return res
    }

    // continue recursively until depth equals 0
    return this.resolver(nameSegments[2], depth - 1, options)
  }

  /**
   * Resolve ipns entries from the provided routing
   *
   * @param {string} name
   * @param {AbortOptions} options
   */
  async _resolveName (name, options) {
    const peerId = peerIdFromString(name)
    const routingKey = ipns.peerIdToRoutingKey(peerId)
    let record

    try {
      record = await this._routing.get(routingKey, options)
    } catch (/** @type {any} */ err) {
      log.error('could not get record from routing', err)

      if (err.code === ERR_NOT_FOUND) {
        throw errcode(new Error(`record requested for ${name} was not found in the network`), 'ERR_NO_RECORD_FOUND')
      }

      throw errcode(new Error(`unexpected error getting the ipns record ${peerId.toString()}`), 'ERR_UNEXPECTED_ERROR_GETTING_RECORD')
    }

    // We should have the public key by now (inline, or in the entry)
    return this._validateRecord(peerId, record)
  }

  /**
   * Validate a resolved record
   *
   * @param {PeerId} peerId
   * @param {Uint8Array} record
   */
  async _validateRecord (peerId, record) {
    // IPNS entry validation
    await ipnsValidator(uint8ArrayConcat([
      uint8ArrayFromString('/ipns/'),
      peerId.toBytes()
    ]), record)

    const ipnsEntry = ipns.unmarshal(record)

    return uint8ArrayToString(ipnsEntry.value)
  }
}
