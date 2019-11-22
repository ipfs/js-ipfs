'use strict'

const PeerInfo = require('peer-info')
const PeerId = require('peer-id')
const multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const res = await ky.post('swarm/addrs', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return Object.keys(res.Addrs).map(id => {
      const peerInfo = new PeerInfo(PeerId.createFromB58String(id))
      res.Addrs[id].forEach(addr => peerInfo.multiaddrs.add(multiaddr(addr)))
      return peerInfo
    })
  }
})
