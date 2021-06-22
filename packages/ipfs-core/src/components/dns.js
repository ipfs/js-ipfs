'use strict'

// dns-nodejs gets replaced by dns-browser when bundled
const dns = require('../runtime/dns-nodejs')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {string} domain
 * @returns {string}
 */
function fqdnFixups (domain) {
  // Allow resolution of .eth names via .eth.link
  // More context at the go-ipfs counterpart: https://github.com/ipfs/go-ipfs/pull/6448
  if (domain.endsWith('.eth')) {
    domain = domain.replace(/.eth$/, '.eth.link')
  }
  return domain
}

module.exports = () => {
  /**
   * @type {import('ipfs-core-types/src/root').API["dns"]}
   */
  const resolveDNS = async (domain, options = { recursive: true }) => { // eslint-disable-line require-await
    if (typeof domain !== 'string') {
      throw new Error('Invalid arguments, domain must be a string')
    }

    domain = fqdnFixups(domain)

    return dns(domain, options)
  }

  return withTimeoutOption(resolveDNS)
}
