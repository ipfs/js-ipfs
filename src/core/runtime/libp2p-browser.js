'use strict'

const WS = require('libp2p-websockets')
const WebRTCStar = require('libp2p-webrtc-star')
const Multiplex = require('pull-mplex')
const SECIO = require('libp2p-secio')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
const libp2p = require('libp2p')
const mergeOptions = require('merge-options')

class Node extends libp2p {
  constructor (_options) {
    const wrtcstar = new WebRTCStar({ id: _options.peerInfo.id })

    const { extend } = _options
    delete _options.extend

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
          wrtcstar
        ],
        streamMuxer: [
          Multiplex
        ],
        connEncryption: [
          SECIO
        ],
        peerDiscovery: [
          wrtcstar.discovery,
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

    super(mergeOptions.call({ concatArrays: extend }, defaults, _options))
  }
}

module.exports = Node
