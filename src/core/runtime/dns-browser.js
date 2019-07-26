/* eslint-env browser */
'use strict'

const TLRU = require('../../utils/tlru')
const { default: PQueue } = require('p-queue')

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
  } else {
    const err = new Error(response.Message)
    return callback(err)
  }
}

module.exports = (domain, opts, callback) => {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }
  opts = opts || {}
  domain = encodeURIComponent(domain)

  if (cache.has(domain)) {
    const response = cache.get(domain)
    return unpackResponse(domain, response, callback)
  }

  let url = `https://ipfs.io/api/v0/dns?arg=${domain}`
  Object.keys(opts).forEach(prop => {
    url += `&${encodeURIComponent(prop)}=${encodeURIComponent(opts[prop])}`
  })

  _httpQueue.add(() => fetch(url, { mode: 'cors' })
    .then((response) => {
      return response.json()
    })
    .then((response) => {
      cache.set(domain, response, ttl)
      return unpackResponse(domain, response, callback)
    })
    .catch((error) => {
      callback(error)
    })
  )
}
