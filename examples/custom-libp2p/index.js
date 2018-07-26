'use strict'

const Libp2p = require('libp2p')
const IPFS = require('ipfs')
const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WebSocketStar = require('libp2p-websocket-star')
const Bootstrap = require('libp2p-railing')
const SPDY = require('libp2p-spdy')
const KadDHT = require('libp2p-kad-dht')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const assert = require('assert')

/**
 * This is the generator we will use to generate our fully customized libp2p node.
 *
 * @param {*} _ipfsNode The ipfs node. This houses the PeerInfo and PeerBook that modules may need
 * @param {*} _ipfsConfig The config that is fetched from the ipfs-repo
 * @returns {Libp2p} Our new libp2p node
 */
const libp2pGenerator = (_ipfsNode, _ipfsConfig) => {
  // Set convenience variables to clearly showcase some of the useful things that are available
  const peerInfo = _ipfsNode._peerInfo
  const peerBook = _ipfsNode._peerBook
  const bootstrapList = _ipfsConfig.Bootstrap

  // Create our WebSocketStar transport and give it our PeerId, straight from the ipfs node
  const wsstar = new WebSocketStar({
    id: peerInfo.id
  })

  // Build and return our libp2p node
  return new Libp2p({
    peerInfo,
    peerBook,
    // Lets limit the connection managers peers and have it check peer health less frequently
    connectionManager: {
      maxPeers: 25,
      pollInterval: 5000
    },
    modules: {
      transport: [
        TCP,
        wsstar
      ],
      streamMuxer: [
        MPLEX,
        SPDY
      ],
      connEncryption: [
        SECIO
      ],
      peerDiscovery: [
        MulticastDNS,
        Bootstrap,
        wsstar.discovery
      ],
      dht: KadDHT
    },
    config: {
      peerDiscovery: {
        mdns: {
          interval: 10000,
          enabled: true
        },
        bootstrap: {
          interval: 10000,
          enabled: true,
          list: bootstrapList
        }
      },
      // Turn on relay with hop active so we can connect to more peers
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true
        }
      },
      dht: {
        kBucketSize: 20
      },
      EXPERIMENTAL: {
        dht: true,
        pubsub: true
      }
    }
  })
}

// Now that we have our custom generator, let's start up the ipfs node!
const node = new IPFS({
  libp2p: libp2pGenerator
})

// Listen for the node to start, so we can log out some metrics
node.once('start', (err) => {
  assert.ifError(err, 'Should startup without issue')

  // Lets log out the number of peers we have every 2 seconds
  setInterval(() => {
    node.swarm.peers((err, peers) => {
      if (err) {
        console.log('An error occurred trying to check our peers:', err)
        process.exit(1)
      }
      console.log(`The node now has ${peers.length} peers.`)
    })
  }, 2000)

  // Log out the bandwidth stats every 4 seconds so we can see how our configuration is doing
  setInterval(() => {
    node.stats.bw((err, stats) => {
      if (err) {
        console.log('An error occurred trying to check our stats:', err)
      }
      console.log(`\nBandwidth Stats: ${JSON.stringify(stats, null, 2)}\n`)
    })
  }, 4000)
})
