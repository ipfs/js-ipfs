'use strict'

const ipns = require('ipns')
const crypto = require('libp2p-crypto')
const PeerId = require('peer-id')
const errcode = require('err-code')
const parallel = require('async/parallel')

const debug = require('debug')
const log = debug('jsipfs:ipns:resolver')
log.error = debug('jsipfs:ipns:resolver:error')

const defaultMaximumRecursiveDepth = 32

class IpnsResolver {
  constructor (routing) {
    this._routing = routing
  }

  resolve (name, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (typeof name !== 'string') {
      const errMsg = `one or more of the provided parameters are not valid`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_PARAMETER'))
    }

    options = options || {}
    const recursive = options.recursive && options.recursive.toString() === 'true'

    const nameSegments = name.split('/')

    if (nameSegments.length !== 3 || nameSegments[0] !== '') {
      const errMsg = `invalid name syntax for ${name}`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_NAME_SYNTAX'))
    }

    const key = nameSegments[2]

    // Define a maximum depth if recursive option enabled
    let depth

    if (recursive) {
      depth = defaultMaximumRecursiveDepth
    }

    this.resolver(key, depth, (err, res) => {
      if (err) {
        return callback(err)
      }

      log(`${name} was locally resolved correctly`)
      callback(null, res)
    })
  }

  // Recursive resolver according to the specified depth
  resolver (name, depth, callback) {
    // Exceeded recursive maximum depth
    if (depth === 0) {
      const errMsg = `could not resolve name (recursion limit of ${defaultMaximumRecursiveDepth} exceeded)`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_RESOLVE_RECURSION_LIMIT'))
    }

    this._resolveName(name, (err, res) => {
      if (err) {
        return callback(err)
      }

      const nameSegments = res.split('/')

      // If obtained a ipfs cid or recursive option is disabled
      if (nameSegments[1] === 'ipfs' || !depth) {
        return callback(null, res)
      }

      // continue recursively until depth equals 0
      this.resolver(nameSegments[2], depth - 1, callback)
    })
  }

  // resolve ipns entries from the provided routing
  _resolveName (name, callback) {
    let peerId

    try {
      peerId = PeerId.createFromB58String(name)
    } catch (err) {
      return callback(err)
    }

    const { routingKey, routingPubKey } = ipns.getIdKeys(peerId.toBytes())

    parallel([
      // Name should be the hash of a public key retrievable from ipfs.
      // We retrieve public key to add it to the PeerId, as the IPNS record may not have it.
      (cb) => this._routing.get(routingPubKey.toBuffer(), cb),
      (cb) => this._routing.get(routingKey.toBuffer(), cb)
    ], (err, res) => {
      if (err) {
        if (err.code !== 'ERR_NOT_FOUND') {
          const errMsg = `unexpected error getting the ipns record ${peerId.id}`

          log.error(errMsg)
          return callback(errcode(new Error(errMsg), 'ERR_UNEXPECTED_ERROR_GETTING_RECORD'))
        }
        const errMsg = `record requested was not found for ${name} (${routingKey}) in the network`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_NO_RECORD_FOUND'))
      }

      // Public key
      try {
        // Insert it into the peer id public key, to be validated by IPNS validator
        peerId.pubKey = crypto.keys.unmarshalPublicKey(res[0])
      } catch (err) {
        const errMsg = `found public key record that we couldn't convert to a value`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_INVALID_PUB_KEY_RECEIVED'))
      }

      // IPNS entry
      let ipnsEntry
      try {
        ipnsEntry = ipns.unmarshal(res[1])
      } catch (err) {
        const errMsg = `found ipns record that we couldn't convert to a value`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_INVALID_RECORD_RECEIVED'))
      }

      ipns.extractPublicKey(peerId, ipnsEntry, (err, pubKey) => {
        if (err) {
          return callback(err)
        }

        // IPNS entry validation
        ipns.validate(pubKey, ipnsEntry, (err) => {
          if (err) {
            return callback(err)
          }

          callback(null, ipnsEntry.value.toString())
        })
      })
    })
  }
}

exports = module.exports = IpnsResolver
