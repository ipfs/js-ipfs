'use strict'

const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WS = require('libp2p-websockets')
const WebSocketStarMulti = require('libp2p-websocket-star-multi')
const Bootstrap = require('libp2p-bootstrap')
const KadDHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
const Multiplex = require('pull-mplex')
const SECIO = require('libp2p-secio')
const libp2p = require('libp2p')
const mergeOptions = require('merge-options')
const multiaddr = require('multiaddr')

class Node extends libp2p {
  constructor (_options) {
    // this can be replaced once optional listening is supported with the below code. ref: https://github.com/libp2p/interface-transport/issues/41
    // const wsstar = new WebSocketStar({ id: _options.peerInfo.id })
    const wsstarServers = _options.peerInfo.multiaddrs.toArray().map(String).filter(addr => addr.includes('p2p-websocket-star'))
    _options.peerInfo.multiaddrs.replace(wsstarServers.map(multiaddr), '/p2p-websocket-star') // the ws-star-multi module will replace this with the chosen ws-star servers
    const wsstar = new WebSocketStarMulti({ servers: wsstarServers, id: _options.peerInfo.id, ignore_no_online: !wsstarServers.length || _options.wsStarIgnoreErrors })

    const defaults = {
      switch: {
        denyTTL: 2 * 60 * 1e3, // 2 minute base
        denyAttempts: 5, // back off 5 times
        maxParallelDials: 150,
        maxColdCalls: 50,
        dialTimeout: 10e3 // Be strict with dial time
      },
      modules: {
        transport: [
          TCP,
          WS,
          wsstar
        ],
        streamMuxer: [
          Multiplex
        ],
        connEncryption: [
          SECIO
        ],
        peerDiscovery: [
          MulticastDNS,
          Bootstrap,
          wsstar.discovery
        ],
        dht: KadDHT,
        pubsub: GossipSub
      },
      config: {
        peerDiscovery: {
          autoDial: true,
          mdns: {
            enabled: true
          },
          bootstrap: {
            enabled: true
          },
          websocketStar: {
            enabled: true
          }
        },
        dht: {
          kBucketSize: 20,
          enabled: false,
          randomWalk: {
            enabled: false
          }
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
