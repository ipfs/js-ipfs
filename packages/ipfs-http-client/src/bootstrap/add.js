'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const Multiaddr = require('multiaddr')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/bootstrap/add')>}
   */
  async function add (addr, options = {}) {
    const res = await api.post('bootstrap/add', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: addr,
        ...options
      }),
      headers: options.headers
    })

    const { Peers } = await res.json()

    return { Peers: Peers.map(ma => new Multiaddr(ma)) }
  }

  return add
})
