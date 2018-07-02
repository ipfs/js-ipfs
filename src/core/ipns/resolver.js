'use strict'

const ipns = require('ipns')
const { fromB58String } = require('multihashes')

const debug = require('debug')
const log = debug('jsipfs:ipns:resolver')
log.error = debug('jsipfs:ipns:resolver:error')

const ERR_INVALID_NAME_SYNTAX = 'ERR_INVALID_NAME_SYNTAX'
const ERR_INVALID_RECORD_RECEIVED = 'ERR_INVALID_RECORD_RECEIVED'
const ERR_NO_LOCAL_RECORD_FOUND = 'ERR_NO_LOCAL_RECORD_FOUND'
const ERR_RESOLVE_RECURSION = 'ERR_RESOLVE_RECURSION'

const defaultMaximumRecursiveDepth = 32

class IpnsResolver {
  constructor (repo) {
    this.repo = repo
    this._resolver = undefined // Add Router resolver
  }

  resolve (name, publicKey, options, callback) {
    const nameSegments = name.split('/')

    if (nameSegments.length !== 3 || nameSegments[0] !== '') {
      log.error(`invalid name syntax for ${name}`)
      return callback(Object.assign(new Error(`invalid name syntax for ${name}`), { code: ERR_INVALID_NAME_SYNTAX }))
    }

    const key = nameSegments[2]
    let depth
    let resolverFn

    // Define a maximum depth if recursive option
    if (options.recursive) {
      depth = defaultMaximumRecursiveDepth
    }

    // TODO nocache
    // TODO set default resolverFn

    if (options.local) {
      resolverFn = this.resolveLocal
    }

    if (!resolverFn) {
      return callback(new Error('not implemented yet'))
    }

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
    this._resolver = resolverFn

    // Exceeded recursive maximum depth
    if (depth === 0) {
      const errorStr = `could not resolve name (recursion limit of ${defaultMaximumRecursiveDepth} exceeded)`

      log.error(errorStr)
      return callback(Object.assign(new Error(errorStr), { code: ERR_RESOLVE_RECURSION }))
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

      return this.resolver(nameSegments[2], publicKey, depth - 1, resolverFn, callback)
    })
  }

  // resolve ipns entries locally using the datastore
  resolveLocal (name, publicKey, callback) {
    const ipnsKey = ipns.getLocalKey(fromB58String(name))

    this.repo.datastore.get(ipnsKey, (err, dsVal) => {
      if (err) {
        log.error('local record requested was not found')
        return callback(Object.assign(new Error('local record requested was not found'), { code: ERR_NO_LOCAL_RECORD_FOUND }))
      }

      if (!Buffer.isBuffer(dsVal)) {
        log.error('found ipns record that we couldn\'t convert to a value')
        return callback(Object.assign(new Error('found ipns record that we couldn\'t convert to a value'), { code: ERR_INVALID_RECORD_RECEIVED }))
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
