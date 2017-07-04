'use strict'

const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const Railing = require('libp2p-railing')
const spdy = require('libp2p-spdy')
const KadDHT = require('libp2p-kad-dht')
const multiplex = require('libp2p-multiplex')
const secio = require('libp2p-secio')
const libp2p = require('libp2p')

function mapMuxers (list) {
  return list.map((pref) => {
    if (typeof pref !== 'string') {
      return pref
    }
    switch (pref.trim().toLowerCase()) {
      case 'spdy': return spdy
      case 'multiplex': return multiplex
      default:
        throw new Error(pref + ' muxer not available')
    }
  })
}

function getMuxers (muxers) {
  const muxerPrefs = process.env.LIBP2P_MUXER
  if (muxerPrefs && !muxers) {
    return mapMuxers(muxerPrefs.split(','))
  } else if (muxers) {
    return mapMuxers(muxers)
  } else {
    return [multiplex, spdy]
  }
}

class Node extends libp2p {
  constructor (peerInfo, peerBook, options) {
    options = options || {}

    const modules = {
      transport: [
        new TCP(),
        new WS()
      ],
      connection: {
        muxer: getMuxers(options.muxer),
        crypto: [ secio ]
      },
      discovery: []
    }

    if (options.dht) {
      modules.DHT = KadDHT
    }

    if (options.mdns) {
      const mdns = new MulticastDNS(peerInfo, 'ipfs.local')
      modules.discovery.push(mdns)
    }

    if (options.bootstrap) {
      const r = new Railing(options.bootstrap)
      modules.discovery.push(r)
    }

    if (options.modules && options.modules.transport) {
      options.modules.transport.forEach((t) => modules.transport.push(t))
    }

    if (options.modules && options.modules.discovery) {
      options.modules.discovery.forEach((d) => modules.discovery.push(d))
    }

    super(modules, peerInfo, peerBook, options)
  }
}

module.exports = Node
