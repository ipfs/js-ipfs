'use strict'

const dns = require('dns')
const _ = require('lodash')
const errcode = require('err-code')

module.exports = (domain, opts, callback) => {
  resolveDnslink(domain)
    .catch(err => {
      // If the code is not ENOTFOUND or ERR_DNSLINK_NOT_FOUND then throw the error
      if (err.code !== 'ENOTFOUND' && err.code !== 'ERR_DNSLINK_NOT_FOUND') throw err

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
      callback(null, dnslinkRecord.replace('dnslink=', ''))
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
        throw errcode(`No dnslink records found for domain: ${domain}`, 'ERR_DNSLINK_NOT_FOUND')
      }
      return dnslinkRecords[0]
    })
}
