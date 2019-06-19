'use strict'

const ipns = require('ipns')
const ky = require('ky-universal').default
const { Record } = require('libp2p-record')
const dnsSocket = require('dns-socket')
const dnsPacket = require('dns-packet')
const Cid = require('cids')

const errcode = require('err-code')
const debug = require('debug')
const log = debug('ipfs:ipns:workers-api-datastore')
log.error = debug('ipfs:ipns:workers-api:error')

// DNS datastore aims to mimic the same encoding as routing when storing records
// to the local datastore
class DNSDataStore {
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
    if (!Buffer.isBuffer(key)) {
      return callback(errcode(new Error('DNS datastore key must be a buffer'), 'ERR_INVALID_KEY'))
    }

    if (!Buffer.isBuffer(value)) {
      return callback(errcode(new Error(`DNS datastore value must be a buffer`), 'ERR_INVALID_VALUE'))
    }

    const cid = new Cid(key.slice(ipns.namespaceLength))

    // http://localhost:8000
    // https://ipns.dev
    ky.put(
      'https://ipns.dev',
      {
        json: {
          key: cid.toV1().toString(),
          record: value.toString('base64')
        }
      })
      .then(data => {
        setImmediate(() => callback())
      })
      .catch(err => {
        setImmediate(() => callback(err))
      })
  }

  /**
   * Get a value from the local datastore indexed by the received key properly encoded.
   * @param {Buffer} key identifier of the value to be obtained.
   * @param {function(Error, Buffer)} callback
   * @returns {void}
   */
  get (key, callback) {
    if (!Buffer.isBuffer(key)) {
      return callback(errcode(new Error(`DNS datastore key must be a buffer`), 'ERR_INVALID_KEY'))
    }

    dohBinary(key, callback)
  }
}

exports = module.exports = DNSDataStore
function dns (key, callback) {
  const socket = dnsSocket()
  const cid = new Cid(key.slice(ipns.namespaceLength))

  socket.query({
    questions: [{
      type: 'TXT',
      name: `${cid.toV1().toString()}.dns.ipns.dev`
    }]
  }, 5300, 'localhost', (err, res) => {
    console.log(err, res) // prints the A record for google.com
  })
}
function dohBinary (key, callback) {
  const cid = new Cid(key.slice(ipns.namespaceLength))
  const buf = dnsPacket.encode({
    type: 'query',
    id: getRandomInt(1, 65534),
    flags: dnsPacket.RECURSION_DESIRED,
    questions: [{
      type: 'TXT',
      name: `${cid.toV1().toString()}.dns.ipns.dev`
    }]
  })
  // https://dns.google.com/experimental
  // https://cloudflare-dns.com/dns-query
  // https://mozilla.cloudflare-dns.com/dns-query
  ky
    .get('https://cloudflare-dns.com/dns-query', {
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
      console.log('TCL: dohBinary -> data', data)

      if (!data && data.answers.length < 1) {
        throw errcode(new Error('Record not found'), 'ERR_NOT_FOUND')
      }
      console.log('TCL: doh -> data', data)
      const record = new Record(key, Buffer.from(Buffer.concat(data.answers[0].data).toString(), 'base64'))
      setImmediate(() => callback(null, record.value))
    })
    .catch(err => {
      setImmediate(() => callback(err))
    })
}

function dohJson (key, callback) {
  const cid = new Cid(key.slice(ipns.namespaceLength))

  // https://dns.google.com/resolve
  // https://cloudflare-dns.com/dns-query
  // https://mozilla.cloudflare-dns.com/dns-query
  ky
    .get('https://cloudflare-dns.com/dns-query', {
      searchParams: {
        name: `${cid.toV1().toString()}.dns.ipns.dev`,
        type: 'TXT',
        cd: 1,
        ad: 0,
        ct: 'application/dns-json'
      }
    })
    .json()
    .then(data => {
      if (!data && !data.Answer && data.Answer.length < 1) {
        throw errcode(new Error('Record not found'), 'ERR_NOT_FOUND')
      }
      const record = new Record(key, Buffer.from(data.Answer[0].data, 'base64'))
      setImmediate(() => callback(null, record.value))
    })
    .catch(err => {
      setImmediate(() => callback(err))
    })
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
