'use strict'

const dns = require('dns')

module.exports = (domain, opts, callback) => {
  dns.resolveTxt(domain, (err, records) => {
    if (err) {
      return callback(err, null)
    }

    // TODO: implement recursive option

    for (const record of records) {
      if (record[0].startsWith('dnslink=')) {
        return callback(null, record[0].substr(8, record[0].length - 1))
      }
    }

    callback(new Error('domain does not have a txt dnslink entry'))
  })
}
