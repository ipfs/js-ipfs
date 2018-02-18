'use strict'

// dns-nodejs gets replaced by dns-browser when webpacked/browserified
const dns = require('../runtime/dns-nodejs')
const promisify = require('promisify-es6')

module.exports = () => {
  return promisify((domain, opts, callback) => {
    if (typeof domain !== 'string') {
      return callback(new Error('Invalid arguments, domain must be a string'))
    }

    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    dns(domain, opts, callback)
  })
}
