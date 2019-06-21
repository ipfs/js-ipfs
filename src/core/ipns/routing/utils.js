'use strict'

const multibase = require('multibase')
const ipns = require('ipns')
const { Record } = require('libp2p-record')
const dnsPacket = require('dns-packet')
const Cid = require('cids')
const errcode = require('err-code')
const debug = require('debug')
const ky = require('ky-universal').default
const log = debug('ipfs:ipns:doh')
log.error = debug('ipfs:ipns:doh:error')

function dohBinary (url, domain, key, callback) {
  const start = Date.now()
  let keyStr
  let buf
  try {
    keyStr = keyToBase32(key)
    buf = dnsPacket.encode({
      type: 'query',
      questions: [{
        type: 'TXT',
        name: `${keyStr}.${domain}`
      }]
    })
  } catch (err) {
    log.error(err)
    return callback(err)
  }
  ky
    .get(url, {
      searchParams: {
        dns: buf.toString('base64')
      },
      headers: {
        accept: 'application/dns-message'
      }
    })
    .arrayBuffer()
    .then(data => {
      data = dnsPacket.decode(Buffer.from(data))

      if (!data && data.answers.length < 1) {
        throw errcode(new Error('Record not found'), 'ERR_NOT_FOUND')
      }
      const record = new Record(key, Buffer.from(Buffer.concat(data.answers[0].data).toString(), 'base64'))
      log(`${domain} time: ${(Date.now() - start)}ms`)
      setImmediate(() => callback(null, record.value))
    })
    .catch(err => {
      setImmediate(() => callback(err))
    })
}

/**
 * Libp2p Key to base32 encoded string
 *
 * @param {Buffer} key
 * @returns {string}
 */
function keyToBase32 (key) {
  const cid = new Cid(key.slice(ipns.namespaceLength))
  return cid.toV1().toString()
}

module.exports = {
  dohBinary,
  keyToBase32,
  encodeBase32: (buf) => {
    const m = multibase.encode('base32', buf).slice(1) // slice off multibase codec

    return m.toString().toUpperCase() // should be uppercase for interop with go
  },
  validator: {
    func: (key, record, cb) => ipns.validator.validate(record, key, cb)
  },
  selector: (k, records) => ipns.validator.select(records[0], records[1])
}
