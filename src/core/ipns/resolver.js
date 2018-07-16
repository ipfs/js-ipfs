'use strict'

const ipns = require('ipns')
const { fromB58String } = require('multihashes')

const debug = require('debug')
const log = debug('jsipfs:ipns:resolver')
log.error = debug('jsipfs:ipns:resolver:error')

const ERR_INVALID_NAME_SYNTAX = 'ERR_INVALID_NAME_SYNTAX'
const ERR_INVALID_RECORD_RECEIVED = 'ERR_INVALID_RECORD_RECEIVED'
const ERR_NO_LOCAL_RECORD_FOUND = 'ERR_NO_LOCAL_RECORD_FOUND'
const ERR_RESOLVE_RECURSION_LIMIT = 'ERR_RESOLVE_RECURSION_LIMIT'

const defaultMaximumRecursiveDepth = 32

class IpnsResolver {
  constructor (routing, repo) {
    this.routing = routing
    this.repo = repo
    this._resolver = undefined // Add Router resolver
  }

  resolve (name, publicKey, options, callback) {
    const nameSegments = name.split('/')

    if (nameSegments.length !== 3 || nameSegments[0] !== '') {
      const error = `invalid name syntax for ${name}`

      log.error(error)
      return callback(Object.assign(new Error(error), { code: ERR_INVALID_NAME_SYNTAX }))
    }

    const key = nameSegments[2]

    // Define a maximum depth if recursive option enabled
    let depth

    if (options.recursive) {
      depth = defaultMaximumRecursiveDepth
    }

    // Get the intended resoulver function
    // TODO set default resolverFn

    let resolverFn

    if (options.local) {
      resolverFn = this.resolveLocal
    }

    if (!resolverFn) {
      return callback(new Error('not implemented yet'))
    }

    // TODO Routing - Get public key from routing

    this.resolver(key, publicKey, depth, resolverFn, (err, res) => {
      if (err) {
        return callback(err)
      }

      log(`${name} was locally resolved correctly`)
      return callback(null, res)
    })
  }

  // Recursive resolver according to the specified depth
  resolver (name, publicKey, depth, resolverFn, callback) {
    // bind resolver function
    this._resolver = resolverFn

    // Exceeded recursive maximum depth
    if (depth === 0) {
      const error = `could not resolve name (recursion limit of ${defaultMaximumRecursiveDepth} exceeded)`

      log.error(error)
      return callback(Object.assign(new Error(error), { code: ERR_RESOLVE_RECURSION_LIMIT }))
    }

    this._resolver(name, publicKey, (err, res) => {
      if (err) {
        return callback(err)
      }

      const nameSegments = res.split('/')

      // If obtained a ipfs cid or recursive option is disabled
      if (nameSegments[1] === 'ipfs' || !depth) {
        return callback(null, res)
      }

      // continue recursively until depth equals 0
      return this.resolver(nameSegments[2], publicKey, depth - 1, resolverFn, callback)
    })
  }

  // resolve ipns entries locally using the datastore
  resolveLocal (name, publicKey, callback) {
    const ipnsKey = ipns.getLocalKey(fromB58String(name))

    this.repo.datastore.get(ipnsKey, (err, dsVal) => {
      if (err) {
        const error = `local record requested was not found for ${name} (${ipnsKey})`

        log.error(error)
        return callback(Object.assign(new Error(error), { code: ERR_NO_LOCAL_RECORD_FOUND }))
      }

      if (!Buffer.isBuffer(dsVal)) {
        const error = `found ipns record that we couldn't convert to a value`

        log.error(error)
        return callback(Object.assign(new Error(error), { code: ERR_INVALID_RECORD_RECEIVED }))
      }

      const ipnsEntry = ipns.unmarshal(dsVal)

      // Record validation
      ipns.validate(publicKey, ipnsEntry, (err) => {
        if (err) {
          return callback(err)
        }

        return callback(null, ipnsEntry.value.toString())
      })
    })
  }
}

exports = module.exports = IpnsResolver
