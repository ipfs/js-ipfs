'use strict'

const dns = require('dns')
const _ = require('lodash')
const isIPFS = require('is-ipfs')
const errcode = require('err-code')

const MAX_RECURSIVE_DEPTH = 32

module.exports = (domain, opts, callback) => {
  // recursive is true by default, it's set to false only if explicitly passed as argument in opts
  const recursive = opts.recursive == null ? true : Boolean(opts.recursive)

  let depth
  if (recursive) {
    depth = MAX_RECURSIVE_DEPTH
  }

  return recursiveResolveDnslink(domain, depth, callback)
}

function recursiveResolveDnslink (domain, depth, callback) {
  if (depth === 0) {
    return callback(errcode(new Error('recursion limit exceeded'), 'ERR_DNSLINK_RECURSION_LIMIT'))
  }

  return resolveDnslink(domain)
    .catch(err => {
      // If the code is not ENOTFOUND or ERR_DNSLINK_NOT_FOUND or ENODATA then throw the error
      if (err.code !== 'ENOTFOUND' && err.code !== 'ERR_DNSLINK_NOT_FOUND' && err.code !== 'ENODATA') throw err

      if (domain.startsWith('_dnslink.')) {
        // The supplied domain contains a _dnslink component
        // Check the non-_dnslink domain
        const rootDomain = domain.replace('_dnslink.', '')
        return resolveDnslink(rootDomain)
      }
      // Check the _dnslink subdomain
      const _dnslinkDomain = `_dnslink.${domain}`
      // If this throws then we propagate the error
      return resolveDnslink(_dnslinkDomain)
    })
    .then(dnslinkRecord => {
      const result = dnslinkRecord.replace('dnslink=', '')
      const domainOrCID = result.split('/')[2]
      const isIPFSCID = isIPFS.cid(domainOrCID)

      if (isIPFSCID || !depth) {
        return callback(null, result)
      }
      return recursiveResolveDnslink(domainOrCID, depth - 1, callback)
    })
    .catch(callback)
}

function resolveDnslink (domain) {
  const DNSLINK_REGEX = /^dnslink=.+$/
  return new Promise((resolve, reject) => {
    dns.resolveTxt(domain, (err, records) => {
      if (err) return reject(err)
      resolve(records)
    })
  })
    .then(records => {
      return _.chain(records).flatten().filter(record => {
        return DNSLINK_REGEX.test(record)
      }).value()
    })
    .then(dnslinkRecords => {
      // we now have dns text entries as an array of strings
      // only records passing the DNSLINK_REGEX text are included
      if (dnslinkRecords.length === 0) {
        throw errcode(new Error(`No dnslink records found for domain: ${domain}`), 'ERR_DNSLINK_NOT_FOUND')
      }
      return dnslinkRecords[0]
    })
}
