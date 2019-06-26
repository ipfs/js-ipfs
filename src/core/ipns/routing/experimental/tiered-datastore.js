'use strict'

const pany = require('p-any')
const pSettle = require('p-settle')
const debug = require('debug')
const Errors = require('interface-datastore').Errors

const log = debug('ipfs:ipns:tiered-datastore')
log.error = debug('ipfs:ipns:tiered-datastore:error')

class TieredDatastore {
  constructor (stores) {
    this.stores = stores.slice()
  }

  put (key, value, callback) {
    pSettle(this.stores.map(s => s.put(key, value)))
      .then(results => {
        let fulfilled = false
        results.forEach(r => {
          if (r.isFulfilled) {
            fulfilled = true
          } else {
            log.error(r.reason)
          }
        })

        if (fulfilled) {
          return setImmediate(() => callback())
        }
        setImmediate(() => callback(Errors.dbWriteFailedError()))
      })
  }

  get (key, callback) {
    pany(this.stores.map(s => s.get(key)))
      .then(r => setImmediate(() => callback(null, r)))
      .catch(err => {
        log.error(err)
        setImmediate(() => callback(Errors.notFoundError()))
      })
  }
}

module.exports = TieredDatastore
