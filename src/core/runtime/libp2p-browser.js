'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const Multiplex = require('libp2p-multiplex')
const SECIO = require('libp2p-secio')
const Railing = require('libp2p-railing')
const libp2p = require('libp2p')

class Node extends libp2p {
  constructor (peerInfo, peerBook, options) {
    options = options || {}
    const wstar = new WebRTCStar()

    const modules = {
      transport: [new WS(), wstar],
      connection: {
        muxer: [Multiplex],
        crypto: [SECIO]
      },
      discovery: [wstar.discovery]
    }

    if (options.bootstrap) {
      const r = new Railing(options.bootstrap)
      modules.discovery.push(r)
    }

    super(modules, peerInfo, peerBook, options)
  }
}

module.exports = Node
