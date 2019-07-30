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

function unpackResponse (domain, response, callback) {
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
  domain = encodeURIComponent(domain)

  // `opts` impact returned value, so we cache per domain+opts
  const query = `${domain}${JSON.stringify(opts)}`

  // try cache first
  if (!opts.nocache && cache.has(query)) {
    const response = cache.get(query)
    return unpackResponse(domain, response, callback)
  }

  // fallback to sending DNSLink query to ipfs.io
  // TODO: replace this with generic DNS over HTTPS: https://github.com/ipfs/js-ipfs/issues/2212
  let url = `https://ipfs.io/api/v0/dns?arg=${domain}`
  Object.keys(opts).forEach(prop => {
    url += `&${encodeURIComponent(prop)}=${encodeURIComponent(opts[prop])}`
  })

  _httpQueue.add(async () => {
    const response = await ky(url, { mode: 'cors' }).json()
    cache.set(query, response, ttl)
    setImmediate(() => unpackResponse(domain, response, callback))
  }).catch((err) => setImmediate(() => callback(err)))
}
