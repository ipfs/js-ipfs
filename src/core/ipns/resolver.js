'use strict'

const ipns = require('ipns')
const { fromB58String } = require('multihashes')
const Record = require('libp2p-record').Record
const errcode = require('err-code')

const debug = require('debug')
const log = debug('jsipfs:ipns:resolver')
log.error = debug('jsipfs:ipns:resolver:error')

const defaultMaximumRecursiveDepth = 32

class IpnsResolver {
  constructor (routing, repo) {
    this._routing = routing
    this._repo = repo
    this._resolver = undefined // TODO Routing - add Router resolver
  }

  resolve (name, peerId, options, callback) {
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
    const local = !(options.local === false)

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

    // Get the intended resoulver function
    // TODO Routing - set default resolverFn

    let resolverFn

    if (local) {
      resolverFn = this._resolveLocal
    }

    if (!resolverFn) {
      return callback(new Error('not implemented yet'))
    }

    this.resolver(key, depth, peerId, resolverFn, (err, res) => {
      if (err) {
        return callback(err)
      }

      log(`${name} was locally resolved correctly`)
      callback(null, res)
    })
  }

  // Recursive resolver according to the specified depth
  resolver (name, depth, peerId, resolverFn, callback) {
    // bind resolver function
    this._resolver = resolverFn

    // Exceeded recursive maximum depth
    if (depth === 0) {
      const errMsg = `could not resolve name (recursion limit of ${defaultMaximumRecursiveDepth} exceeded)`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_RESOLVE_RECURSION_LIMIT'))
    }

    this._resolver(name, peerId, (err, res) => {
      if (err) {
        return callback(err)
      }

      const nameSegments = res.split('/')

      // If obtained a ipfs cid or recursive option is disabled
      if (nameSegments[1] === 'ipfs' || !depth) {
        return callback(null, res)
      }

      // continue recursively until depth equals 0
      this.resolver(nameSegments[2], depth - 1, peerId, resolverFn, callback)
    })
  }

  // resolve ipns entries locally using the datastore
  _resolveLocal (name, peerId, callback) {
    const { ipnsKey } = ipns.getIdKeys(fromB58String(name))

    this._repo.datastore.get(ipnsKey, (err, dsVal) => {
      if (err) {
        const errMsg = `local record requested was not found for ${name} (${ipnsKey})`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_NO_LOCAL_RECORD_FOUND'))
      }

      if (!Buffer.isBuffer(dsVal)) {
        const errMsg = `found ipns record that we couldn't convert to a value`

        log.error(errMsg)
        return callback(errcode(new Error(errMsg), 'ERR_INVALID_RECORD_RECEIVED'))
      }

      const record = Record.deserialize(dsVal)
      const ipnsEntry = ipns.unmarshal(record.value)

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
