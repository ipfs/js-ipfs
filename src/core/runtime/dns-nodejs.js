'use strict'

const dns = require('dns')

module.exports = (domain, opts, callback) => {
  resolveDnslink(domain)
    .catch(err => {
      // If the code is not ENOTFOUND the throw the error
      if (err.code !== 'ENOTFOUND') throw err

      if (domain.indexOf('_dnslink') === -1) {
        // Check the _dnslink subdomain
        const _dnslinkDomain = ['_dnslink', ...domain.split('.')].join('.')
        // If this throws then we propagate the error
        return resolveDnslink(_dnslinkDomain)
      } else if (domain.split('.').indexOf('_dnslink') === 0) {
        // The supplied domain contains a _dnslink component
        // Check the non-_dnslink domain
        const rootDomain = domain.split('.').slice(1).join('.')
        return resolveDnslink(rootDomain)
      }
      throw err
    })
    .then(dnslinkRecord => {
      callback(null, dnslinkRecord.substr(8, dnslinkRecord.length - 1))
    })
    .catch(callback)
}

function resolveDnslink(domain) {
  const DNSLINK_REGEX = /^dnslink=.+$/
  return new Promise((resolve, reject) => {
    dns.resolveTxt(domain, (err, records) => {
      if (err) return reject(err)
      resolve(records)
    })
  })
    .then(records => {
      // records is an array of arrays of strings
      // the below expression flattens it into an array of strings
      const flatRecords = [].concat(...records)
      return flatRecords.filter(record => {
        return DNSLINK_REGEX.test(record)
      })
    })
    .then(dnslinkRecords => {
      // we now have dns text entries as an array of strings
      // only records passing the DNSLINK_REGEX text are included
      if (dnslinkRecords > 1) {
        const err = new Error(`Multiple dnslink records found for domain: ${domain}`)
        err.code = 'EMULTFOUND'
        throw err
      } else if (dnslinkRecords.length === 0) {
        const err = new Error(`No dnslink records found for domain: ${domain}`)
        err.code = 'ENOTFOUND'
        throw err
      }
      return dnslinkRecords[0]
    })
}
