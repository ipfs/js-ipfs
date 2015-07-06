/*
 * routing/index.js Routing is the front door for everything that happens on the routing layer.
 * Other modules present in the remaining layers should not require to interact with modules
 * behind this level
 */

var mDNSDiscovery = require('./discovery/mdns')
var Peer = require('./routers/dht/peer')
var Id = require('./routers/dht/peer/id')
var network = require('network')
var Multiaddr = require('multiaddr')
var DHT = require('./routers/dht')

exports = module.exports = Routing

function Routing () {
  var self = this

  if (!(self instanceof Routing)) {
    throw new Error('Routing should be called with new')
  }

  self.router
  self.peer

  // instantiate this peer

  self.start = function (cb) {
    network.get_private_ip(function (err, ip) {
      if (err) {
        cb(err)
      }
      var multiaddrs = []
      multiaddrs.push(new Multiaddr('/ip4/' + ip + '/tcp/' + 4001))
      self.peer = new Peer(Id.create(), multiaddrs)
      self.useRouterDHT()
      self.useDiscoveryMDNS()
      if (cb) {
        cb()
      }
    })
  }

  // routing interface

  self.putValue = function (key, buf) {}
  self.getValue = function (key) {}
  self.provide = function (key) {}
  self.findPeer = function (key) {}
  self.ping = function (key) {}

  // select strategies (plugins) used

  self.useRouterDHT = function () {
    self.router = new DHT(self.peer)
  }

  self.useRouterMDNS = function () {}

  self.useDiscoveryBootstrapList = function () {}

  self.useDiscoveryMDNS = function () {
    mDNSDiscovery(function (err, peer) {
      if (err) {
        return console.log('mDNS Discovery err: ', err)
      }
      self.router.addPeer(peer)
    })
  }

  self.useDiscoveryRandomWalk = function () {
    // use router to find a random peer
  }

}

