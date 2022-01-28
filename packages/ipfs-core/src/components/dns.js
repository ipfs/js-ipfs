// dns-nodejs gets replaced by dns-browser when bundled
import { resolveDnslink } from 'ipfs-core-config/dns'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

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

export function createDns () {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["dns"]}
   */
  const resolveDNS = async (domain, options = { recursive: true }) => { // eslint-disable-line require-await
    if (typeof domain !== 'string') {
      throw new Error('Invalid arguments, domain must be a string')
    }

    domain = fqdnFixups(domain)

    return resolveDnslink(domain, options)
  }

  return withTimeoutOption(resolveDNS)
}
