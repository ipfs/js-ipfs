'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const WebSocketStar = require('libp2p-websocket-star')
const Multiplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const libp2p = require('libp2p')
const defaultsDeep = require('@nodeutils/defaults-deep')

class Node extends libp2p {
  constructor (_options) {
    const wrtcstar = new WebRTCStar({id: _options.peerInfo.id})
    const wsstar = new WebSocketStar({id: _options.peerInfo.id})

    const defaults = {
      modules: {
        transport: [
          WS,
          wrtcstar,
          wsstar
        ],
        streamMuxer: [
          Multiplex
        ],
        connEncryption: [
          SECIO
        ],
        peerDiscovery: [
          wrtcstar.discovery,
          wsstar.discovery,
          Bootstrap
        ]
      },
      config: {
        peerDiscovery: {
          bootstrap: {
            enabled: true
          },
          webRTCStar: {
            enabled: true
          },
          websocketStar: {
            enabled: true
          }
        },
        EXPERIMENTAL: {
          dht: false,
          pubsub: false
        }
      }
    }

    super(defaultsDeep(_options, defaults))
  }
}

module.exports = Node
