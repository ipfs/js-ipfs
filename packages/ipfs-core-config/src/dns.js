import dns from 'dns'
import isIPFS from 'is-ipfs'
import errcode from 'err-code'
import { promisify } from 'util'

const MAX_RECURSIVE_DEPTH = 32

/**
 * @param {string} domain
 * @param {object} opts
 * @param {boolean} [opts.recursive]
 */
export function resolveDnslink (domain, opts) {
  // recursive is true by default, it's set to false only if explicitly passed as argument in opts
  const nonRecursive = !opts.recursive

  /** @type {number | undefined} */
  let depth = MAX_RECURSIVE_DEPTH
  if (nonRecursive) {
    depth = undefined
  }

  return recursiveResolveDnslink(domain, depth)
}

/**
 * @param {string} domain
 * @param {number} [depth]
 * @returns {Promise<string>}
 */
async function recursiveResolveDnslink (domain, depth) {
  if (depth === 0) {
    throw errcode(new Error('recursion limit exceeded'), 'ERR_DNSLINK_RECURSION_LIMIT')
  }

  let dnslinkRecord

  try {
    dnslinkRecord = await resolve(domain)
  } catch (/** @type {any} */ err) {
    // If the code is not ENOTFOUND or ERR_DNSLINK_NOT_FOUND or ENODATA then throw the error
    if (err.code !== 'ENOTFOUND' && err.code !== 'ERR_DNSLINK_NOT_FOUND' && err.code !== 'ENODATA') {
      throw err
    }

    if (domain.startsWith('_dnslink.')) {
      // The supplied domain contains a _dnslink component
      // Check the non-_dnslink domain
      dnslinkRecord = await resolve(domain.replace('_dnslink.', ''))
    } else {
      // Check the _dnslink subdomain
      const _dnslinkDomain = `_dnslink.${domain}`
      // If this throws then we propagate the error
      dnslinkRecord = await resolve(_dnslinkDomain)
    }
  }

  const result = dnslinkRecord.replace('dnslink=', '')
  const domainOrCID = result.split('/')[2]
  const isIPFSCID = isIPFS.cid(domainOrCID)

  if (isIPFSCID || !depth) {
    return result
  }

  return recursiveResolveDnslink(domainOrCID, depth - 1)
}

/**
 * @param {string} domain
 */
async function resolve (domain) {
  const DNSLINK_REGEX = /^dnslink=.+$/
  const records = await promisify(dns.resolveTxt)(domain)
  const dnslinkRecords = records.reduce((rs, r) => rs.concat(r), [])
    .filter(record => DNSLINK_REGEX.test(record))

  // we now have dns text entries as an array of strings
  // only records passing the DNSLINK_REGEX text are included
  if (dnslinkRecords.length === 0) {
    throw errcode(new Error(`No dnslink records found for domain: ${domain}`), 'ERR_DNSLINK_NOT_FOUND')
  }

  return dnslinkRecords[0]
}
