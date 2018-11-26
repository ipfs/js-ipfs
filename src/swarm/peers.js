'use strict'

const promisify = require('promisify-es6')
const multiaddr = require('multiaddr')
const PeerId = require('peer-id')

module.exports = (send) => {
  return promisify((opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    const verbose = opts.v || opts.verbose
    send({
      path: 'swarm/peers',
      qs: opts
    }, (err, response) => {
      if (err) {
        return callback(err)
      }
      const peerInfo = parsePeersResponse(verbose, response)
      callback(null, peerInfo)
    })
  })
}

function parsePeersResponse (verbose, response) {
  // go-ipfs <= 0.4.4
  if (Array.isArray(response.Strings)) {
    return response.Strings.map(parseLegacyPeer.bind(null, verbose))
  }
  // go-ipfs >= 0.4.5
  if (Array.isArray(response.Peers)) {
    return response.Peers.map(parsePeer.bind(null, verbose))
  }
  return []
}

function parseLegacyPeer (verbose, peer) {
  const res = {}
  try {
    if (verbose) {
      const parts = peer.split(' ')
      res.addr = multiaddr(parts[0])
      res.latency = parts[1]
    } else {
      res.addr = multiaddr(peer)
    }
    res.peer = PeerId.createFromB58String(res.addr.getPeerId())
  } catch (error) {
    res.error = error
    res.rawPeerInfo = peer
  }
  return res
}

function parsePeer (verbose, peer) {
  const res = {}
  try {
    res.addr = multiaddr(peer.Addr)
    res.peer = PeerId.createFromB58String(peer.Peer)
    res.muxer = peer.Muxer
  } catch (error) {
    res.error = error
    res.rawPeerInfo = peer
  }
  if (peer.Latency) {
    res.latency = peer.Latency
  }
  if (peer.Streams) {
    res.streams = peer.Streams
  }
  return res
}
