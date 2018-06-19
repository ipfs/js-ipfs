'use strict'

const peerId = require('peer-id')
const waterfall = require('async/waterfall')

const IpnsEntry = require('./pb/ipnsEntry')
const utils = require('./utils')
const validator = require('./validator')

const defaultRecordTtl = 60 * 60 * 1000

/*
  IpnsPublisher is capable of publishing and resolving names to the IPFS
  routing system.
  */
class IpnsPublisher {
  constructor (routing, repo) {
    this.routing = routing
    this.repo = repo
  }

  // publish record with a eol
  publishWithEOL (privKey, value, eol, callback) {
    this.updateOrCreateRecord(privKey, value, eol, (err, record) => {
      if (err) {
        return callback(err)
      }

      // TODO ROUTING - Add record
      callback(null, record)
    })
  }

  // Accepts a keypair, as well as a value (ipfsPath), and publishes it out to the routing system
  publish (privKey, value, callback) {
    const eol = new Date(Date.now() + defaultRecordTtl)

    this.publishWithEOL(privKey, value, eol, (err, res) => {
      if (err) {
        return callback(err)
      }

      callback(res)
    })
  }

  // Returns the record this node has published corresponding to the given peer ID.
  // If `checkRouting` is true and we have no existing record, this method will check the routing system for any existing records.
  getPublished (peerId, checkRouting, callback) {
    this.repo.datastore.get(utils.generateIpnsDsKey(peerId.id), (err, dsVal) => {
      let result

      if (!err) {
        if (Buffer.isBuffer(dsVal)) {
          result = dsVal
        } else {
          return callback(new Error('found ipns record that we couldn\'t convert to a value'))
        }
      } else if (err.notFound) {
        if (!checkRouting) {
          return callback(null, {
            peerId: peerId
          })
        }
        // TODO ROUTING
      } else {
        return callback(err)
      }

      // unmarshal data
      result = IpnsEntry.unmarshal(dsVal)

      return callback(null, {
        peerId: peerId,
        record: result
      })
    })
  }

  createEntryRecord (privKey, value, seqNumber, eol, callback) {
    const validity = eol.toISOString()
    const validityType = IpnsEntry.validityType.EOL
    const sequence = seqNumber

    validator.sign(privKey, value, validityType, validity, (err, signature) => {
      if (err) {
        return callback(err)
      }

      // TODO confirm private key format compliance with go-ipfs

      // Create IPNS entry record
      const ipnsEntry = IpnsEntry.create(value, signature, validityType, validity, sequence)

      return callback(null, ipnsEntry)
    })
  }

  updateOrCreateRecord (privKey, value, eol, callback) {
    waterfall([
      (cb) => peerId.createFromPrivKey(privKey.bytes.toString('base64'), cb),
      (id, cb) => this.getPublished(id, false, cb)
    ], (err, result) => {
      if (err) {
        callback(err)
      }

      const { peerId, record } = result

      // Determinate the record sequence number
      let seqNumber = 0
      if (record && record.sequence !== undefined) {
        seqNumber = record.value.toString() !== value ? record.sequence + 1 : record.sequence
      }

      // Create record
      this.createEntryRecord(privKey, value, seqNumber, eol, (err, entryData) => {
        if (err) {
          return callback(err)
        }

        // TODO IMPROVEMENT - set ttl (still experimental feature for go)

        // Marshal record
        const data = IpnsEntry.marshal(entryData)

        // Store the new record
        this.repo.datastore.put(utils.generateIpnsDsKey(peerId.id), data, (err, res) => {
          if (err) {
            return callback(err)
          }

          return callback(null, entryData)
        })
      })
    })
  }
}

exports = module.exports = IpnsPublisher
