/* eslint-env browser */
'use strict'

const TLRU = require('../../utils/tlru')
const { default: PQueue } = require('p-queue')
const { default: ky } = require('ky-universal')

// Avoid sending multiple queries for the same hostname by caching results
const cache = new TLRU(1000)
// TODO: /api/v0/dns does not return TTL yet: https://github.com/ipfs/go-ipfs/issues/5884
// However we know browsers themselves cache DNS records for at least 1 minute,
// which acts a provisional default ttl: https://stackoverflow.com/a/36917902/11518426
const ttl = 60 * 1000

// browsers limit concurrent connections per host,
// we don't want preload calls to exhaust the limit (~6)
const _httpQueue = new PQueue({ concurrency: 4 })

// Delegated HTTP resolver sending DNSLink queries to ipfs.io
// TODO: replace hardcoded host with configurable DNS over HTTPS: https://github.com/ipfs/js-ipfs/issues/2212
const api = ky.create({
  prefixUrl: 'https://ipfs.io/api/v0/',
  hooks: {
    afterResponse: [
      async response => {
        const query = new URLSearchParams(new URL(response.url).search).toString()
        const json = await response.json()
        cache.set(query, json, ttl)
        return json
      }
    ]
  }
})

function unpackResponse (response, callback) {
  if (response.Path) {
    return callback(null, response.Path)
  }
  return callback(new Error(response.Message))
}

module.exports = (domain, opts, callback) => {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }
  opts = opts || {}

  const searchParams = new URLSearchParams(opts)
  searchParams.set('arg', domain)

  // try cache first
  const query = searchParams.toString()
  if (!opts.nocache && cache.has(query)) {
    const response = cache.get(query)
    return setImmediate(() => unpackResponse(response, callback))
  }

  _httpQueue.add(async () => {
    const response = await api.get('dns', { searchParams })
    setImmediate(() => unpackResponse(response, callback))
  }).catch((err) => setImmediate(() => callback(err)))
}
