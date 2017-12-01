'use strict'

const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const WebSocketStar = require('libp2p-websocket-star')
const Railing = require('libp2p-railing')
const KadDHT = require('libp2p-kad-dht')
const Multiplex = require('libp2p-multiplex')
const SECIO = require('libp2p-secio')
const libp2p = require('libp2p')

class Node extends libp2p {
  constructor (peerInfo, peerBook, options) {
    options = options || {}
    const wsstar = new WebSocketStar({id: peerInfo.id})

    const modules = {
      transport: [new TCP(), new WS(), wsstar],
      connection: {
        muxer: [Multiplex],
        crypto: [SECIO]
      },
      discovery: [wsstar.discovery]
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
