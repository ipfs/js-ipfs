'use strict'

const IpnsEntry = require('./pb/ipnsEntry')
const utils = require('./utils')
const validator = require('./validator')

const { fromB58String } = require('multihashes')

class IpnsResolver {
  constructor (repo) {
    this.repo = repo
  }

  resolve (name, publicKey, options, callback) {
    const nameSegments = name.split('/')

    if (nameSegments.length !== 3 || nameSegments[0] !== '') {
      return callback(new Error(`invalid name syntax for ${name}`))
    }

    const key = nameSegments[2]

    // TODO recursive
    // TODO nocache

    if (options.local) {
      this.resolveLocal(key, publicKey, (err, res) => {
        if (err) {
          return callback(err)
        }

        return callback(null, res)
      })
    } else {
      return callback(new Error('not implemented yet'))
    }
  }

  // https://github.com/ipfs/go-ipfs-routing/blob/master/offline/offline.go
  resolveLocal (name, publicKey, callback) {
    const ipnsKey = utils.generateIpnsDsKey(fromB58String(name))

    this.repo.datastore.get(ipnsKey, (err, dsVal) => {
      if (err) {
        return callback(err)
      }

      if (!Buffer.isBuffer(dsVal)) {
        return callback(new Error('found ipns record that we couldn\'t convert to a value'))
      }

      const ipnsEntry = IpnsEntry.unmarshal(dsVal)

      // Record validation
      validator.verify(publicKey, ipnsEntry, (err) => {
        if (err) {
          return callback(err)
        }

        return callback(null, ipnsEntry.value.toString())
      })
    })
  }
}

exports = module.exports = IpnsResolver
