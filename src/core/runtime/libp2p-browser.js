'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const WebSocketStarMulti = require('libp2p-websocket-star-multi')
const Multiplex = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const libp2p = require('libp2p')
const defaultsDeep = require('@nodeutils/defaults-deep')
const multiaddr = require('multiaddr')

class Node extends libp2p {
  constructor (_options) {
    const wrtcstar = new WebRTCStar({ id: _options.peerInfo.id })

    // this can be replaced once optional listening is supported with the below code. ref: https://github.com/libp2p/interface-transport/issues/41
    // const wsstar = new WebSocketStar({ id: _options.peerInfo.id })
    const wsstarServers = _options.peerInfo.multiaddrs.toArray().map(String).filter(addr => addr.includes('p2p-websocket-star'))
    _options.peerInfo.multiaddrs.replace(wsstarServers.map(multiaddr), '/p2p-websocket-star') // the ws-star-multi module will replace this with the chosen ws-star servers
    const wsstar = new WebSocketStarMulti({ servers: wsstarServers, id: _options.peerInfo.id, ignore_no_online: !wsstarServers.length || _options.wsStarIgnoreErrors })

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
