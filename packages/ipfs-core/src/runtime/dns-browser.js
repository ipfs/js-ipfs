/* eslint-env browser */
'use strict'

const TLRU = require('../utils/tlru')
const { default: PQueue } = require('p-queue')
const HTTP = require('ipfs-utils/src/http')

// Avoid sending multiple queries for the same hostname by caching results
const cache = new TLRU(1000)
// TODO: /api/v0/dns does not return TTL yet: https://github.com/ipfs/go-ipfs/issues/5884
// However we know browsers themselves cache DNS records for at least 1 minute,
// which acts a provisional default ttl: https://stackoverflow.com/a/36917902/11518426
const ttl = 60 * 1000

// browsers limit concurrent connections per host,
// we don't want preload calls to exhaust the limit (~6)
const httpQueue = new PQueue({ concurrency: 4 })

const ipfsPath = (response) => {
  if (response.Path) return response.Path
  throw new Error(response.Message)
}

module.exports = async (fqdn, opts) => { // eslint-disable-line require-await
  const resolveDnslink = async (fqdn, opts = {}) => {
    const searchParams = new URLSearchParams(opts)
    searchParams.set('arg', fqdn)

    // try cache first
    const query = searchParams.toString()
    if (!opts.nocache && cache.has(query)) {
      const response = cache.get(query)
      return ipfsPath(response)
    }

    // fallback to delegated DNS resolver
    const response = await httpQueue.add(async () => {
      // Delegated HTTP resolver sending DNSLink queries to ipfs.io
      // TODO: replace hardcoded host with configurable DNS over HTTPS: https://github.com/ipfs/js-ipfs/issues/2212
      const res = await HTTP.get('https://ipfs.io/api/v0/dns', { searchParams })
      const query = new URL(res.url).search.slice(1)
      const json = await res.json()
      cache.set(query, json, ttl)

      return json
    })
    return ipfsPath(response)
  }

  return resolveDnslink(fqdn, opts)
}
