'use strict'

const IPFS = require('../../../../../src/core')
const multiaddr = require('multiaddr')
// In a project, replace by
// const IPFS = require('ipfs')

const series = require('async/series')

function spawnNode (options, callback) {
  options.path = options.path || '/ipfd/tmp/' + Math.random()

  const node = new IPFS(options.path)

  series([
    (cb) => node.init({ emptyRepo: true, bits: 2048 }, cb),
    (cb) => {
      node.config.get((err, config) => {
        if (err) { return cb(err) }

        if (!multiaddr.isMultiaddr(multiaddr(options.signalAddr))) {
          return cb(new Error('non valid signalAddr, needs to be a multiaddr'))
        }

        const peerId = config.Identity.PeerID
        const sma = `/libp2p-webrtc-star${options.signalAddr}/wss/ipfs/${peerId}`

        config.Addresses.Swarm = [ sma ]
        config.Discovery.MDNS.Enabled = false

        node.config.replace(config, cb)
      })
    },
    (cb) => node.load(cb),
    (cb) => node.goOnline(cb)
  ], (err) => callback(err, node))
}

module.exports = spawnNode
