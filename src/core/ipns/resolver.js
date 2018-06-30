'use strict'

const ipns = require('ipns')
const { fromB58String } = require('multihashes')

const debug = require('debug')
const log = debug('jsipfs:ipns:resolver')
log.error = debug('jsipfs:ipns:resolver:error')

const ERR_INVALID_NAME_SYNTAX = 'ERR_INVALID_NAME_SYNTAX'
const ERR_INVALID_RECORD_RECEIVED = 'ERR_INVALID_RECORD_RECEIVED'
const ERR_NO_LOCAL_RECORD_FOUND = 'ERR_NO_LOCAL_RECORD_FOUND'

class IpnsResolver {
  constructor (repo) {
    this.repo = repo
  }

  resolve (name, localPublicKey, options, callback) {
    const nameSegments = name.split('/')

    if (nameSegments.length !== 3 || nameSegments[0] !== '') {
      log.error(`invalid name syntax for ${name}`)
      return callback(Object.assign(new Error(`invalid name syntax for ${name}`), { code: ERR_INVALID_NAME_SYNTAX }))
    }

    const key = nameSegments[2]

    // TODO recursive
    // TODO nocache

    if (options.local) {
      this.resolveLocal(key, localPublicKey, (err, res) => {
        if (err) {
          return callback(err)
        }

        log(`${name} was locally resolved correctly`)
        return callback(null, res)
      })
    } else {
      return callback(new Error('not implemented yet'))
    }
  }

  // resolve ipns entries locally using the datastore
  resolveLocal (name, localPublicKey, callback) {
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
      ipns.validate(localPublicKey, ipnsEntry, (err) => {
        if (err) {
          return callback(err)
        }

        return callback(null, ipnsEntry.value.toString())
      })
    })
  }
}

exports = module.exports = IpnsResolver
