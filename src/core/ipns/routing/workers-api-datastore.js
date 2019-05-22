'use strict'

const { Key } = require('interface-datastore')
const ipns = require('ipns')
const ky = require('ky-universal').default
const { Record } = require('libp2p-record')
const { toB58String } = require('multihashes')
const { encodeBase32 } = require('./utils')

const errcode = require('err-code')
const debug = require('debug')
const log = debug('ipfs:ipns:workers-api-datastore')
log.error = debug('ipfs:ipns:workers-api:error')

// Offline datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
class WorkersApiDataStore {
  constructor (repo) {
    this._repo = repo
  }

  /**
   * Put a value to the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value.
   * @param {Buffer} value value to be stored.
   * @param {function(Error)} callback
   * @returns {void}
   */
  put (key, value, callback) {
    if (key.toString().startsWith('/pk/')) {
      return callback()
    }
    // console.log('TCL: WorkersApiDataStore -> put -> value', key.toString())
    // console.log('TCL: WorkersApiDataStore -> put -> key', toB58String(key.slice(ipns.namespaceLength)))

    if (!Buffer.isBuffer(key)) {
      const errMsg = `Offline datastore key must be a buffer`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_KEY'))
    }

    if (!Buffer.isBuffer(value)) {
      const errMsg = `Offline datastore value must be a buffer`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_VALUE'))
    }

    ky.put(
      'https://ipns.hugodias.me',
      {
        json: {
          key: toB58String(key.slice(ipns.namespaceLength)),
          value: value.toString('base64')
        }
      })
      .text()
      .then(data => {
        // console.log('publish response', data)
        callback()
      })
      .catch(err => console.log(err))
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value to be obtained.
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  get (key, callback) {
    // console.log('TCL: WorkersApiDataStore -> get -> key', toB58String(key.slice(ipns.namespaceLength)))
    if (!Buffer.isBuffer(key)) {
      const errMsg = `Offline datastore key must be a buffer`

      log.error(errMsg)
      return callback(errcode(new Error(errMsg), 'ERR_INVALID_KEY'))
    }

    const start = Date.now()
    ky.get(
      'https://ipns.hugodias.me?key=' + toB58String(key.slice(ipns.namespaceLength)))
      .text()
      .then(data => {
        // console.log('resolve response', data)
        const record = new Record(key, Buffer.from(data, 'base64'))
        console.log('time:', (Date.now() - start), 'ms')
        callback(null, record.value)
      })
      .catch(err => console.log(err))

    // this._repo.datastore.get(routingKey, (err, res) => {
    //   if (err) {
    //     return callback(err)
    //   }

    //   // Unmarshal libp2p record as the DHT does
    //   let record
    //   try {
    //     record = Record.deserialize(res)
    //   } catch (err) {
    //     log.error(err)
    //     return callback(err)
    //   }

    //   callback(null, record.value)
    // })
  }

  // encode key properly - base32(/ipns/{cid})
  _routingKey (key) {
    return new Key('/' + encodeBase32(key), false)
  }
}

exports = module.exports = WorkersApiDataStore
