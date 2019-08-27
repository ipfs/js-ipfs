'use strict'

// dns-nodejs gets replaced by dns-browser when webpacked/browserified
const dns = require('../runtime/dns-nodejs')
const promisify = require('promisify-es6')

function fqdnFixups (domain) {
  // Allow resolution of .eth names via .eth.link
  // More context at the go-ipfs counterpart: https://github.com/ipfs/go-ipfs/pull/6448
  if (domain.endsWith('.eth')) {
    domain = domain.replace(/.eth$/, '.eth.link')
  }
  return domain
}

module.exports = () => {
  return promisify((domain, opts, callback) => {
    if (typeof domain !== 'string') {
      return callback(new Error('Invalid arguments, domain must be a string'))
    }

    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    opts = opts || {}
    domain = fqdnFixups(domain)

    dns(domain, opts, callback)
  })
}
