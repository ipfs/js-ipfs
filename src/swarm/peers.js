'use strict'

const multiaddr = require('multiaddr')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.direction != null) searchParams.append('direction', options.direction)
    if (options.latency != null) searchParams.append('latency', options.latency)
    if (options.streams != null) searchParams.append('streams', options.streams)
    if (options.verbose != null) searchParams.append('verbose', options.verbose)

    const res = await ky.post('swarm/peers', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return (res.Peers || []).map(peer => {
      const info = {}
      try {
        info.addr = multiaddr(peer.Addr)
        info.peer = peer.Peer
      } catch (error) {
        info.error = error
        info.rawPeerInfo = peer
      }
      if (peer.Muxer) {
        info.muxer = peer.Muxer
      }
      if (peer.Latency) {
        info.latency = peer.Latency
      }
      if (peer.Streams) {
        info.streams = peer.Streams
      }
      if (peer.Direction != null) {
        info.direction = peer.Direction
      }
      return info
    })
  }
})
