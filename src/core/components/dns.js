'use strict'

// dns-nodejs gets replaced by dns-browser when webpacked/browserified
const dns = require('../runtime/dns-nodejs')
const callbackify = require('callbackify')

function fqdnFixups (domain) {
  // Allow resolution of .eth names via .eth.link
  // More context at the go-ipfs counterpart: https://github.com/ipfs/go-ipfs/pull/6448
  if (domain.endsWith('.eth')) {
    domain = domain.replace(/.eth$/, '.eth.link')
  }
  return domain
}

module.exports = () => {
  return callbackify.variadic(async (domain, opts) => { // eslint-disable-line require-await
    opts = opts || {}

    if (typeof domain !== 'string') {
      throw new Error('Invalid arguments, domain must be a string')
    }

    domain = fqdnFixups(domain)

    return dns(domain, opts)
  })
}
