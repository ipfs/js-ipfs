'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const WebSocketStarMulti = require('libp2p-websocket-star-multi')
const Multiplex = require('pull-mplex')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
const libp2p = require('libp2p')
const mergeOptions = require('merge-options')
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
      switch: {
        denyTTL: 2 * 60 * 1e3, // 2 minute base
        denyAttempts: 5, // back off 5 times
        maxParallelDials: 100,
        maxColdCalls: 25,
        dialTimeout: 20e3
      },
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
        ],
        dht: KadDHT,
        pubsub: GossipSub
      },
      config: {
        peerDiscovery: {
          autoDial: true,
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
        dht: {
          enabled: false
        },
        pubsub: {
          enabled: true,
          emitSelf: true
        }
      }
    }

    super(mergeOptions(defaults, _options))
  }
}

module.exports = Node
