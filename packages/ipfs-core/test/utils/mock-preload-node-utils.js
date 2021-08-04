/* eslint-env browser */
'use strict'

// @ts-ignore no types
const toUri = require('multiaddr-to-uri')
const errCode = require('err-code')
const HTTP = require('ipfs-utils/src/http')
const waitFor = require('./wait-for')

/**
 * @typedef {import('multiformats/cid').CID} CID
 */

const defaultPort = 1138
const defaultAddr = `/dnsaddr/localhost/tcp/${defaultPort}`

module.exports.defaultAddr = defaultAddr

/**
 * Get the stored preload CIDs for the server at `addr`
 *
 * @param {string} [addr]
 * @returns {Promise<string[]>}
 */
const getPreloadCids = async (addr) => {
  const res = await HTTP.get(`${toUri(addr || defaultAddr)}/cids`)
  return res.json()
}

module.exports.getPreloadCids = getPreloadCids

/**
 * Clear the stored preload URLs for the server at `addr`
 *
 * @param {string} [addr]
 */
module.exports.clearPreloadCids = addr => {
  return HTTP.delete(`${toUri(addr || defaultAddr)}/cids`)
}

/**
 * Wait for the passed CIDs to appear in the CID list from the preload node
 *
 * @param {CID | CID[] | string | string[]} cids
 * @param {object} [opts]
 * @param {number} [opts.timeout]
 * @param {string} [opts.addr]
 */
module.exports.waitForCids = async (cids, opts) => {
  const options = opts || {}
  options.timeout = options.timeout || 1000

  const cidArr = Array.isArray(cids) ? cids : [cids]
  const cidStrs = cidArr.map(cid => cid.toString()) // Allow passing CID instance

  await waitFor(async () => {
    const preloadCids = await getPreloadCids(options.addr)

    // See if our cached preloadCids includes all the cids we're looking for.
    /** @type {{ missing: string[], duplicates: string[] }} */
    const results = { missing: [], duplicates: [] }
    const { missing, duplicates } = cidStrs.reduce((results, cid) => {
      const count = preloadCids.filter(preloadedCid => preloadedCid === cid).length
      if (count === 0) {
        results.missing.push(cid)
      } else if (count > 1) {
        results.duplicates.push(cid)
      }
      return results
    }, results)

    if (duplicates.length) {
      throw errCode(new Error(`Multiple occurrences of ${duplicates} found`), 'ERR_DUPLICATE')
    }

    return missing.length === 0
  }, {
    name: 'CIDs to be preloaded',
    interval: 5,
    timeout: options.timeout
  })
}
