'use strict'

const Libp2p = require('libp2p')
const IPFS = require('ipfs')
const TCP = require('libp2p-tcp')
const MulticastDNS = require('libp2p-mdns')
const WebSocketStar = require('libp2p-websocket-star')
const Bootstrap = require('libp2p-bootstrap')
const SPDY = require('libp2p-spdy')
const KadDHT = require('libp2p-kad-dht')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const assert = require('assert')

/**
 * Options for the libp2p bundle
 * @typedef {Object} libp2pBundle~options
 * @property {PeerInfo} peerInfo - The PeerInfo of the IPFS node
 * @property {PeerBook} peerBook - The PeerBook of the IPFS node
 * @property {Object} config - The config of the IPFS node
 * @property {Object} options - The options given to the IPFS node
 */

/**
 * This is the bundle we will use to create our fully customized libp2p bundle.
 *
 * @param {libp2pBundle~options} opts The options to use when generating the libp2p node
 * @returns {Libp2p} Our new libp2p node
 */
const libp2pBundle = (opts) => {
  // Set convenience variables to clearly showcase some of the useful things that are available
  const peerInfo = opts.peerInfo
  const peerBook = opts.peerBook
  const bootstrapList = opts.config.Bootstrap

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
      minPeers: 25,
      maxPeers: 100,
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
        autoDial: true, // auto dial to peers we find when we have less peers than `connectionManager.minPeers`
        mdns: {
          interval: 10000,
          enabled: true
        },
        bootstrap: {
          interval: 30e3,
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
        enabled: true,
        kBucketSize: 20,
        randomWalk: {
          enabled: true,
          interval: 10e3, // This is set low intentionally, so more peers are discovered quickly. Higher intervals are recommended
          timeout: 2e3 // End the query quickly since we're running so frequently
        }
      },
      EXPERIMENTAL: {
        pubsub: true
      }
    }
  })
}

// Now that we have our custom libp2p bundle, let's start up the ipfs node!
const node = new IPFS({
  libp2p: libp2pBundle
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
