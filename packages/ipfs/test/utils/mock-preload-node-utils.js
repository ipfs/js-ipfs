/* eslint-env browser */
'use strict'

const toUri = require('multiaddr-to-uri')
const errCode = require('err-code')
const HTTP = require('ipfs-utils/src/http')
const waitFor = require('./wait-for')

const defaultPort = 1138
const defaultAddr = `/dnsaddr/localhost/tcp/${defaultPort}`

module.exports.defaultAddr = defaultAddr

// Get the stored preload CIDs for the server at `addr`
const getPreloadCids = async (addr) => {
  const res = await HTTP.get(`${toUri(addr || defaultAddr)}/cids`)
  return res.json()
}

module.exports.getPreloadCids = getPreloadCids

// Clear the stored preload URLs for the server at `addr`

module.exports.clearPreloadCids = addr => {
  return HTTP.delete(`${toUri(addr || defaultAddr)}/cids`)
}

// Wait for the passed CIDs to appear in the CID list from the preload node
module.exports.waitForCids = async (cids, opts) => {
  opts = opts || {}
  opts.timeout = opts.timeout || 1000

  cids = Array.isArray(cids) ? cids : [cids]
  cids = cids.map(cid => cid.toString()) // Allow passing CID instance

  await waitFor(async () => {
    const preloadCids = await getPreloadCids(opts.addr)

    // See if our cached preloadCids includes all the cids we're looking for.
    const { missing, duplicates } = cids.reduce((results, cid) => {
      const count = preloadCids.filter(preloadedCid => preloadedCid === cid).length
      if (count === 0) {
        results.missing.push(cid)
      } else if (count > 1) {
        results.duplicates.push(cid)
      }
      return results
    }, { missing: [], duplicates: [] })

    if (duplicates.length) {
      throw errCode(new Error(`Multiple occurances of ${duplicates} found`), 'ERR_DUPLICATE')
    }

    return missing.length === 0
  }, {
    name: 'CIDs to be preloaded',
    interval: 5,
    timeout: opts.timeout
  })
}
