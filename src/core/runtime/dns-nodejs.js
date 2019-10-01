'use strict'

const dns = require('dns')
const flatten = require('lodash.flatten')
const isIPFS = require('is-ipfs')
const errcode = require('err-code')
const promisify = require('promisify-es6')

const MAX_RECURSIVE_DEPTH = 32

module.exports = (domain, opts) => {
  // recursive is true by default, it's set to false only if explicitly passed as argument in opts
  const recursive = opts.recursive == null ? true : Boolean(opts.recursive)

  let depth
  if (recursive) {
    depth = MAX_RECURSIVE_DEPTH
  }

  return recursiveResolveDnslink(domain, depth)
}

async function recursiveResolveDnslink (domain, depth) {
  if (depth === 0) {
    throw errcode(new Error('recursion limit exceeded'), 'ERR_DNSLINK_RECURSION_LIMIT')
  }

  let dnslinkRecord

  try {
    dnslinkRecord = await resolveDnslink(domain)
  } catch (err) {
    // If the code is not ENOTFOUND or ERR_DNSLINK_NOT_FOUND or ENODATA then throw the error
    if (err.code !== 'ENOTFOUND' && err.code !== 'ERR_DNSLINK_NOT_FOUND' && err.code !== 'ENODATA') {
      throw err
    }

    if (domain.startsWith('_dnslink.')) {
      // The supplied domain contains a _dnslink component
      // Check the non-_dnslink domain
      dnslinkRecord = await resolveDnslink(domain.replace('_dnslink.', ''))
    } else {
      // Check the _dnslink subdomain
      const _dnslinkDomain = `_dnslink.${domain}`
      // If this throws then we propagate the error
      dnslinkRecord = await resolveDnslink(_dnslinkDomain)
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

async function resolveDnslink (domain) {
  const DNSLINK_REGEX = /^dnslink=.+$/
  const records = await promisify(dns.resolveTxt)(domain)
  const dnslinkRecords = flatten(records)
    .filter(record => DNSLINK_REGEX.test(record))

  // we now have dns text entries as an array of strings
  // only records passing the DNSLINK_REGEX text are included
  if (dnslinkRecords.length === 0) {
    throw errcode(new Error(`No dnslink records found for domain: ${domain}`), 'ERR_DNSLINK_NOT_FOUND')
  }

  return dnslinkRecords[0]
}
