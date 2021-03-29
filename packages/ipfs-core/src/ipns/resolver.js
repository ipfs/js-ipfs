'use strict'

const ipns = require('ipns')
const PeerId = require('peer-id')
const errcode = require('err-code')
const debug = require('debug')
const log = Object.assign(debug('ipfs:ipns:resolver'), {
  error: debug('ipfs:ipns:resolver:error')
})
const uint8ArrayToString = require('uint8arrays/to-string')

const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code

const defaultMaximumRecursiveDepth = 32

class IpnsResolver {
  /**
   * @param {import('ipfs-core-types/src/utils').BufferStore} routing
   */
  constructor (routing) {
    this._routing = routing
  }

  /**
   * @param {string} name
   * @param {object} options
   * @param {boolean} [options.recursive]
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

    const res = await this.resolver(key, depth)

    log(`${name} was locally resolved correctly`)
    return res
  }

  /**
   * Recursive resolver according to the specified depth
   *
   * @param {string} name
   * @param {number} depth
   * @returns {Promise<string>}
   */
  async resolver (name, depth) {
    // Exceeded recursive maximum depth
    if (depth === 0) {
      const errMsg = `could not resolve name (recursion limit of ${defaultMaximumRecursiveDepth} exceeded)`
      log.error(errMsg)

      throw errcode(new Error(errMsg), 'ERR_RESOLVE_RECURSION_LIMIT')
    }

    const res = await this._resolveName(name)
    const nameSegments = res.split('/')

    // If obtained a ipfs cid or recursive option is disabled
    if (nameSegments[1] === 'ipfs' || !depth) {
      return res
    }

    // continue recursively until depth equals 0
    return this.resolver(nameSegments[2], depth - 1)
  }

  /**
   * Resolve ipns entries from the provided routing
   *
   * @param {string} name
   */
  async _resolveName (name) {
    const peerId = PeerId.createFromCID(name)
    const { routingKey } = ipns.getIdKeys(peerId.toBytes())
    let record

    try {
      record = await this._routing.get(routingKey.uint8Array())
    } catch (err) {
      log.error('could not get record from routing', err)

      if (err.code === ERR_NOT_FOUND) {
        throw errcode(new Error(`record requested for ${name} was not found in the network`), 'ERR_NO_RECORD_FOUND')
      }

      throw errcode(new Error(`unexpected error getting the ipns record ${peerId.toString()}`), 'ERR_UNEXPECTED_ERROR_GETTING_RECORD')
    }

    // IPNS entry
    let ipnsEntry
    try {
      ipnsEntry = ipns.unmarshal(record)
    } catch (err) {
      log.error('could not unmarshal record', err)

      throw errcode(new Error('found ipns record that we couldn\'t convert to a value'), 'ERR_INVALID_RECORD_RECEIVED')
    }

    // We should have the public key by now (inline, or in the entry)
    return this._validateRecord(peerId, ipnsEntry)
  }

  /**
   * Validate a resolved record
   *
   * @param {PeerId} peerId
   * @param {import('ipns').IPNSEntry} ipnsEntry
   */
  async _validateRecord (peerId, ipnsEntry) {
    const pubKey = await ipns.extractPublicKey(peerId, ipnsEntry)

    // IPNS entry validation
    await ipns.validate(pubKey, ipnsEntry)

    return uint8ArrayToString(ipnsEntry.value)
  }
}

exports = module.exports = IpnsResolver
