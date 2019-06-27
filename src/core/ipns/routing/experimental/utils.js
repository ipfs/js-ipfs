/* eslint-disable no-console */
'use strict'

const ipns = require('ipns')
const { Record } = require('libp2p-record')
const dnsPacket = require('dns-packet')
const Cid = require('cids')
const errcode = require('err-code')
const debug = require('debug')
const ky = require('ky-universal').default

const log = debug('ipfs:ipns:doh')
log.error = debug('ipfs:ipns:doh:error')

async function dohBinary (url, domain, key) {
  const start = Date.now()
  const keyStr = keyToBase32(key)
  const buf = dnsPacket.encode({
    type: 'query',
    questions: [{
      type: 'TXT',
      name: `${keyStr}.${domain}`
    }]
  })

  const result = await ky
    .get(url, {
      searchParams: {
        dns: buf.toString('base64')
      },
      headers: {
        accept: 'application/dns-message'
      }
    })
    .arrayBuffer()

  const data = dnsPacket.decode(Buffer.from(result))
  if (!data || data.answers.length < 1) {
    throw errcode(new Error('Record not found'), 'ERR_NOT_FOUND')
  }
  const record = new Record(key, Buffer.from(Buffer.concat(data.answers[0].data).toString(), 'base64'))
  console.log(`Resolved ${keyStr}.${domain} in ${(Date.now() - start)}ms`)

  return record.value
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
  keyToBase32
}
