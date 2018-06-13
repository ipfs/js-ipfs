'use strict'

const IpnsEntry = require('./pb/ipnsEntry')
// const utils = require('./utils')

class IpnsResolver {
  constructor (repo) {
    this.repo = repo
  }

  resolve (name, pubKey, callback) {
    this.repo.datastore.get(name, (err, dsVal) => {
      if (err) {
        return callback(err)
      }

      if (!Buffer.isBuffer(dsVal)) {
        return callback(new Error('found ipns record that we couldn\'t convert to a value'))
      }

      const ipnsEntry = IpnsEntry.unmarshal(dsVal)

      console.log('entry', ipnsEntry)

      return callback(null, 'entry')

      /*
      let result

      if (!err) {
        if (Buffer.isBuffer(dsVal)) {
          result = dsVal
        } else {
          return callback(new Error('found ipns record that we couldn\'t convert to a value'))
        }
      } else if (err.notFound) {
        if (!checkRouting) {
          return callback(null, null)
        }
        // TODO Implement Routing
      } else {
        return callback(err)
      }

      // unmarshal data
      result = IpnsEntry.unmarshal(dsVal)

      return callback(null, result) */
    })
  }
}

exports = module.exports = IpnsResolver
