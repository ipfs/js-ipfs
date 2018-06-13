'use strict'

const peerId = require('peer-id')

const IpnsEntry = require('./pb/ipnsEntry')
const utils = require('./utils')

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
    this.updateRecord(privKey, value, eol, (err, record) => {
      if (err) {
        return callback(err)
      }

      // TODO FUTURE Put record to routing
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
    // TODO https://github.com/ipfs/go-ipfs/blob/master/namesys/publisher.go#L117
    this.repo.datastore.get(utils.generateIpnsDsKey(peerId), (err, dsVal) => {
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

      return callback(null, result)
    })
  }

  createEntryData (privKey, value, seqNumber, eol, callback) {
    const valueBytes = Buffer.from(value)
    const validityType = 0
    const sequence = seqNumber
    const validity = Buffer.from(eol.toISOString())

    const dataForSignature = this.getIpnsEntryDataForSig(valueBytes, validityType, validity)
    privKey.sign(dataForSignature, (err, signature) => {
      if (err) {
        return callback(err)
      }

      // Create IPNS entry record
      const ipnsEntry = IpnsEntry.create(valueBytes, signature, validityType, validity, sequence)

      callback(null, ipnsEntry)
    })
  }

  getIpnsEntryDataForSig (valueBuffer, validityType, validity) {
    return Buffer.concat([valueBuffer, Buffer.from(validityType.toString()), validity])
  }

  updateRecord (privKey, value, eol, callback) {
    peerId.createFromPrivKey(privKey.bytes.toString('base64'), (error, id) => {
      if (error) {
        callback(error)
      }

      this.getPublished(id, false, (error, record) => {
        if (error) {
          callback(error)
        }

        // Determinate the record sequence number
        let seqNumber = 0
        if (record && record.sequence !== undefined) {
          seqNumber = record.value.toString() !== value ? record.sequence + 1 : record.sequence
        }

        // Create record
        this.createEntryData(privKey, value, seqNumber, eol, (err, entryData) => {
          if (err) {
            return callback(err)
          }
          // TODO set ttl (still experimental feature for go)

          // Marshal record
          const data = IpnsEntry.marshal(entryData)

          // Store the new record
          this.repo.datastore.put(utils.generateIpnsDsKey(id), data, (err, res) => {
            if (err) {
              return callback(err)
            }

            return callback(null, entryData)
          })
        })
      })
    })
  }
}

exports = module.exports = IpnsPublisher
